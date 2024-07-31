// import querystring from 'querystring';
import { countdown, randomInt, sleep, getData } from './utils.js';
import { cyan, yellow, blue, green } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";
// import moment from 'moment-timezone';

const accounts = getData("data_coinegg.txt");
const proxies = getData("proxy.txt");

let timeRerun = 10; //phút time nghỉ mỗi lượt chạy
let numberThread = 1; // số luồng chạy /1 lần 

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
		const headers = {};

		const payload = {
            referrer: "",
            "init_data": query 
        };

		const response = await axios.post('https://egg-api.hivehubs.app/api/login/tg', payload, { headers: headers });
		if (response && response.status == 200) {
			return response.data.data.token.token;
		} 
	}catch(e){
		console.log(`[*] Account ${stt} | getToken err: ${e}`);
	}
}
async function getAssets(stt, axios, token)
{
	try{
		const headers = {};

		const payload = {
            token: token 
        };

		const response = await axios.post('https://egg-api.hivehubs.app/api/user/assets', payload, { headers: headers });
		if (response && response.status == 200) {
			return response.data.data;
        }
	}catch(e){
		console.log(`[*] Account ${stt} | getAssets err: ${e}`);
	}
}
async function getEggs(stt, axios, token)
{
	try{
		const headers = {};

		const payload = {
            token: token 
        };

		const response = await axios.post('https://egg-api.hivehubs.app/api/scene/info', payload, { headers: headers });
		if (response && response.status == 200) {
			let parsedData =  JSON.parse(JSON.stringify(response.data));
			parsedData.data.forEach((element, index, array)  => {
				element.eggs.forEach((egg, eggIndex, eggArray) =>{
					var eggObjects = JSON.parse(JSON.stringify(egg))
					collectEggs(stt, axios, token, eggObjects.uid,(index === array.length - 1 && eggIndex === eggArray.length - 1))
				})
			});
        }
	}catch(e){
		console.log(`[*] Account ${stt} | getEggs err: ${e}`);
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

		const response = await axios.post('https://egg-api.hivehubs.app/api/scene/egg/reward', payload, { headers: headers });
		if (response && response.status == 200) {
			if (response.data['data'].a_type) {
				const type = response.data['data'].a_type;
				let icon = (type ==='egg') ? "🥚" : (type ==='diamond') ? "💎" : "💲"
				console.log(`[Nauquu] Account ${stt} | Đã nhặt ${response.data['data'].amount} ${icon}`);
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

		const response = await axios.post('https://egg-api.hivehubs.app/api/invite/list', payload, { headers: headers });
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

		const response = await axios.post('https://egg-api.hivehubs.app/api/invite/reward', payload, { headers: headers });
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
async function main(stt, axios, account) {
	try {
		console.log(cyan.bold(`[Nauquu] Account ${stt} | Login...`));
		await sleep(5);
		let token = await getToken(stt, axios, account);
		if(token){
            const assets = await getAssets(stt, axios, token);
            const diamond = assets['diamond'] ? assets['diamond'].amount : 0;
            const egg = assets['egg'] ? assets['egg'].amount : 0;
            const usdt = assets['usdt'] ? assets['usdt'].amount : 0;
            console.log(`[Nauquu] Account ${stt} | Balance: ${diamond} 💎, ${egg} 🥚, ${usdt} 💲`)
			await getEggs(stt, axios, token)
			let refList = []
			let startId = ""
			let conti = true
			let len = 19
			while (true) {
				const refs = await getRefs(stt, axios, token, startId)
				for (const [index, ref] of refs.entries())  {
					if (ref.flag == 0) {
						refList.push(ref)
					} else {
						len = index
						conti = false
						break;
					}
				}
				startId = refs[len].id
				if (conti == false) break;
			}
			console.log(refList.length);
			if (refList) {
				for (let i = refList.length - 1; i>=0; i--) {
		    		const refAvai = await collectRefs(stt, axios, token, refList[i].id)
					if (!refAvai) break;
				} 
			} else console.log(`[Nauquu] Account ${stt} | Hết ref`);
		}
		console.log(cyan.bold(`[Nauquu] Account ${stt} | Done!`));

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
			await main(stt, axiosInstance, account);
		}
	})
	console.log(`Số luồng chạy: ${tasks.length} ...`);
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
mainLoopMutil()