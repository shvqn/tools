import querystring from 'querystring';
import { countdown, randomInt, sleep, getData, formatTimeToUTC7 } from './utils.js';
import { cyan, yellow, blue, green } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";

const accounts = getData("data_kuroro.txt");
const proxies = getData("proxy.txt");

let timeRerun = 3*60; //phút time nghỉ mỗi lượt chạy
let numberThread = 1; // số luồng chạy /1 lần 

// 

function createAxiosInstance(proxy, query) {
	return new AxiosHelpers({
		headers: {
			'accept': 'application/json, text/plain, */*',
			'accept-language': 'vi;q=0.8',
			'content-type': 'application/json',
			'origin': 'https://ranch.kuroro.com',
			'priority': 'u=1, i',
			"authorization": `Bearer ${query}`,
			'author': 'https://t.me/nauquu',
			'referer': 'https://ranch.kuroro.com/',
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
async function getUserData(stt, axios)
{
	try{
		const response = await axios.get(`https://ranch-api.kuroro.com/api/Game/GetPlayerState`);
		if (response && response.status == 200) {
			return response.data;
		}
	}catch(e){
		console.log(`[Nauquu] Account ${stt} | getUserData err: ${e}`);
	}
}
async function getDailyStreak(stt, axios)
{
	try{
		const response = await axios.get(`https://ranch-api.kuroro.com/api/DailyStreak/GetState`);
		if (response && response.status == 200) {
			return response.data;
		}
	}catch(e){
		console.log(`[Nauquu] Account ${stt} | getDailyStreak err: ${e}`);
	}
}
async function getCoinEarnAway(stt, axios)
{
	try{
		const response = await axios.get(`https://ranch-api.kuroro.com/api/Game/CoinsEarnedAway`);
		if (response && response.status == 200) {
			console.log(cyan.bold(`[Nauquu] Account ${stt} | Claim ${response.data} point`);
		}
	}catch(e){
		console.log(`[Nauquu] Account ${stt} | getCoinEarnAway err: ${e}`);
	}
}


//
async function main(stt,axios) {
	try {	
		const uData = await getUserData(stt, axios)
		if (uData) {
			const coinAmount = uData.coinsSnapshot.value
			const shardsAmount = uData.shards
			const upgradeList = uData.upgrades
			const beastLv = uData.beast.level
			console.log(green.bold(`[Nauquu] Account ${stt} | Balance: ${coinAmount}, Level: ${beastLv}`));
			await getCoinEarnAway(stt, axios)
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
			let urlData = querystring.unescape(account).split('tgWebAppData=')[1].split('&tgWebAppVersion')[0];
			const axiosInstance = createAxiosInstance(proxy, urlData);
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
