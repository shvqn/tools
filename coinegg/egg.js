// import querystring from 'querystring';
import { countdown, randomInt, sleep, getData } from './utils.js';
import { cyan, yellow, blue, green } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";
// import moment from 'moment-timezone';

const accounts = getData("data_coinegg.txt");
const proxies = getData("proxy.txt");

let timeRerun = 10; //phút time nghỉ mỗi lượt chạy
let numberThread = 3; // số luồng chạy /1 lần 

// 
function formatTimeToUTC7(date) {
    const utcOffset = 7; // UTC+7
    const utc7Date = new Date(date.getTime() + utcOffset * 60 * 60 * 1000);

    const hours = String(utc7Date.getUTCHours()).padStart(2, '0');
    const minutes = String(utc7Date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(utc7Date.getUTCSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

function createAxiosInstance(proxy) {
	return new AxiosHelpers({
		headers: {
			'accept': 'application/json, text/plain, */*',
                    'accept-language': 'vi;q=0.8',
                    'content-type': 'application/json',
                    'origin': 'https://app-coop.rovex.io',
                    'priority': 'u=1, i',
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
			const type = response.data['data'].a_type;
			if (type) {
				let icon = (type ==='egg') ? "🥚" : (type ==='diamond') ? "💎" : "💲"
				console.log(`[#] Account ${stt} | Đã nhặt ${response.data['data'].amount} ${icon}`);
			}
        }
	}catch(e){
		console.log(`[*] Account ${stt} | collectEggs err: ${e}`);
	}
}
async function getRefs(stt, axios, token)
{
	try{
		const headers = {};

		const payload = {
            "token": token,
			"start_id": "",
			size: 20
        };

		const response = await axios.post('https://egg-api.hivehubs.app/api/invite/list', payload, { headers: headers });
		if (response && response.status == 200) {
			const refList = response.data.data
			const availableRef = refList.filter(item => item.flag === 0);
			if (availableRef) {
				for (const key of availableRef) {
		    		const refAvai = await collectRefs(stt, axios, token, key.id)
					if (!refAvai) break;
				}
			}
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
			console.log(`[#] Account ${stt} | Claim 2 💎 from ref`);
			return true
		} else {
			console.log(`[#] Account ${stt} | ${response.data.message}`);
			return false
		}
	}catch(e){
		console.log(`[*] Account ${stt} | collectEggs err: ${e}`);
	}
}

//
async function main(stt, axios, account) {
	try {
		console.log(cyan.bold(`[#] Account ${stt} | Login...`));
		await sleep(5);
		let token = await getToken(stt, axios, account);
		if(token){
            const assets = await getAssets(stt, axios, token);
            const diamond = assets['diamond'] ? assets['diamond'].amount : 0;
            const egg = assets['egg'] ? assets['egg'].amount : 0;
            const usdt = assets['usdt'] ? assets['usdt'].amount : 0;
            console.log(`[#] Account ${stt} | Balance: ${diamond} 💎, ${egg} 🥚, ${usdt} 💲`)
			await getEggs(stt, axios, token)
			await getRefs(stt, axios, token)
			
		}
		console.log(cyan.bold(`[#] Account ${stt} | Done!`));

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
			const maskedProxy = proxy?.slice(0, -10) ;
			console.log(`[#] Account ${stt} | Proxy: ${maskedProxy}`);
			console.log(`[#] Account ${stt} | Check IP...`);
			let checkIp = await checkIP(axiosInstance);
			console.log(`[#] Account ${stt} | Run at IP: ${checkIp}`);
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