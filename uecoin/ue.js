import querystring from 'querystring';
import { countdown, randomInt, sleep, getData, formatTimeToUTC7 } from './utils.js';
import { cyan, yellow, blue, green } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";

const accounts = getData("data_ue.txt");
const proxies = getData("proxy.txt");

let timeRerun = 60; //phút time nghỉ mỗi lượt chạy
let numberThread = 1; // số luồng chạy /1 lần 

// 

function createAxiosInstance(proxy) {
	return new AxiosHelpers({
		headers: {
			'accept': 'application/json, text/plain, */*',
			'accept-language': 'vi;q=0.8',
			'content-type': 'application/json',
			'origin': 'https://app-coop.rovex.io',
			'priority': 'u=1, i',
			'author': 'https://t.me/nauquu',
			'referer': 'https://app-coop.rovex.io/',
			'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Brave";v="126"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Windows"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			'sec-gpc': '1',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
		},
		proxy: proxy ? proxy : false,
	});
}
//end config
// main
async function getToken(stt, axios, query)
{
	try{
		const headers ={}
		const payload = {
    		"referrer": "",
			"init_data": query,
		}
		const response = await axios.post(`https://zejlgz.com/api/login/tg`, payload, {headers});
		if (response && response.status == 200) {
			return response.data.data;
		}
	}catch(e){
		console.log(`[Nauquu] Account ${stt} | getToken err: ${e}`);
	}
}
async function getBalance(stt, axios, token)
{
	try{
		const headers ={}
		const payload = {
			token: token
		}
		const response = await axios.post(`https://zejlgz.com/api/user/assets`, payload, {headers});
		if (response && response.status == 200) {
			return response.data.data;
		}
	}catch(e){
		console.log(`[Nauquu] Account ${stt} | getBalance err: ${e}`);
	}
}
async function getEgg(stt, axios, token)
{
	try{
		const headers ={}
		const payload = {
			token: token
		}
		const response = await axios.post(`https://zejlgz.com/api/scene/info`, payload, {headers});
		if (response.data && response.status == 200) {
			let parsedData =  JSON.parse(JSON.stringify(response.data));
			parsedData.data.forEach((element, index, array)  => {
				element.eggs.forEach((egg, eggIndex, eggArray) =>{
					var eggObjects = JSON.parse(JSON.stringify(egg))
					collectEggs(stt, axios, token, eggObjects.uid,(index === array.length - 1 && eggIndex === eggArray.length - 1))
				})
			});
        }
	}catch(e){
		console.log(`[@Nauquu] Account ${stt} | getEgg err: ${e}`);
	}
}
async function collectEggs(stt, axios, token, eggID)
{
	try{
		const headers = {};

		const payload = {
            token: token,
			"egg_uid": eggID
        };

		const response = await axios.post('https://zejlgz.com/api/scene/egg/reward', payload, { headers: headers });
		if (response && response.status == 200) {
			const type = response.data['data'].a_type;
			if (type) {
				console.log(`[Nauquu] Account ${stt} | Đã nhặt ${response.data['data'].amount} ${type}`);
			}
        }
	}catch(e){
		console.log(`[*] Account ${stt} | collectEggs err: ${e}`);
	}
}
async function getRefs(stt, axios, token, startId)
{
	try{
		const headers = {};

		const payload = {
            "token": token,
			"start_id": startId,
			size: 20
        };

		const response = await axios.post('https://zejlgz.com/api/invite/list', payload, { headers: headers });
		if (response && response.status == 200) {
			return response.data.data
        }
	}catch(e){
		console.log(`[*] Account ${stt} | getRefs err: ${e}`);
	}
}
async function collectRefs(stt, axios, token, refID)
{
	try{
		const headers = {};

		const payload = {
            token: token,
			"invite_id": refID
        };

		const response = await axios.post('https://zejlgz.com/api/invite/reward', payload, { headers: headers });
		if (response && response.data.code == 0) {
			console.log(`[Nauquu] Account ${stt} | Claim 2 💎 from ref`);
			return true
		} else {
			console.log(`[Nauquu] Account ${stt} | ${response.data.message}`);
			return false
		}
	}catch(e){
		console.log(`[*] Account ${stt} | collectEggs err: ${e}`);
	}
}

//
async function main(stt, account, axios) {
	try {
		let urlData = querystring.unescape(account).split('tgWebAppData=')[1].split('&tgWebAppVersion')[0];
		const uData = await getToken(stt, axios, urlData)
		const token = uData.token.token
		const name = uData.user.display_name
		await sleep(5);
		const balance = await getBalance(stt, axios, token)
		if (balance) {
			console.log(green.bold(`[Nauquu] Account ${stt} | User: ${name}, UE: ${balance.ue?.amount}, Usdt: ${balance.usdt?.amount}, Diamond: ${balance.diamond?.amount}`));
			await getEgg(stt, axios, token)
			let refList = []
			let startId = ""
			let conti = true
			while (true) {
				const refs = await getRefs(stt, axios, token, startId)
				if (refs) {
					for (const ref of refs)  {
						if (ref.flag == 0) {
							refList.push(ref)
						} else {
							conti = false
							break;
						}
					}
				} else {
					break;
				}
				if (conti == false) break;
				startId = refs[19].id
			}
			if (refList) {
				for (let i = refList.length - 1; i>=0; i--) {
		    		const refAvai = await collectRefs(stt, axios, token, refList[i].id)
					if (!refAvai) break;
				} 
			}
		console.log(cyan.bold(`[Nauquu] Account ${stt} | Done!`));
		}
	} catch (e) {
		console.log(`Main Err: ${e}`);
	}
}

// end main

async function runMulti() {
	const createChunks = (array, size) => {
			const result = [];
			for (let i = 0; i < array.length; i += size) {
					result.push(array.slice(i, i + size));
			}
			return result;
	};
	let countPrx = proxies.length;
	if(numberThread > countPrx) {
			if(countPrx >=30){
					numberThread = 30;
			}else if(countPrx > 0){
					numberThread = countPrx
			}
	}
	const accountChunks = createChunks(accounts, numberThread);

	for (const chunk of accountChunks) {
			let proxy = null;
			const tasks = chunk.map(async (account) => {
					const globalIndex = accounts.indexOf(account);

					if (proxies.length > 0) {
							proxy = proxies[globalIndex % proxies.length];
					}

		if (account) {
			const axiosInstance = createAxiosInstance(proxy);
			let stt = Number(globalIndex) + Number(1);
			let checkIp = await checkIP(axiosInstance);
			console.log(`[Nauquu] Account ${stt} | Run at IP: ${checkIp}`);
			await main(stt, account, axiosInstance);
		}
	})
	await Promise.all(tasks);
}
}

// default
async function checkIP(axios) {
	try {
		const rs = await axios.get("https://api.myip.com");
		const ip = rs.data?.ip;
		const country = rs.data?.country;
		return `${ip} - Country: ${country}`;
	} catch (err) {
		console.log("err checkip: ", err);
		return null;
	}
}

async function mainLoopMutil() {
	while (true) {
		await runMulti();
		await countdown(timeRerun * 60);
	}
}
mainLoopMutil();
