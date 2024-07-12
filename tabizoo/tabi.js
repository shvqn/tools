import querystring from 'querystring';
import { countdown, randomInt, sleep, getData } from './utils.js';
import { cyan, yellow, blue, green } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";

const accounts = getData("data_tabi.txt");
const proxies = getData("proxy.txt");

let timeRerun = 8*60; //phút time nghỉ mỗi lượt chạy
let numberThread = 1; // số luồng chạy /1 lần 

// 
function formatTimeToUTC7(date) {
    const utcOffset = 7; // UTC+7
	date = new Date(date)
    const utc7Date = new Date(date.getTime() + utcOffset * 60 * 60 * 1000);

    const hours = String(utc7Date.getUTCHours()).padStart(2, '0');
    const minutes = String(utc7Date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(utc7Date.getUTCSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

function createAxiosInstance(proxy) {
	return new AxiosHelpers({
		headers: {
			"accept": "*/*",
			"accept-language": "vi,vi-VN;q=0.9,fr-FR;q=0.8,fr;q=0.7,en;q=0.6",
			"content-type": "application/json",
			"priority": "u=1, i",
			"sec-ch-ua": "\"Google Chrome\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"",
			"sec-ch-ua-mobile": "?0",
			"sec-ch-ua-platform": "\"Windows\"",
			"sec-fetch-dest": "empty",
			"sec-fetch-mode": "cors",
			"sec-fetch-site": "same-site",
			Origin: "https://tma.cryptorank.io",
			"Referer": "https://tma.cryptorank.io/",
			"Referrer-Policy": "strict-origin-when-cross-origin",
		},
		proxy: proxy ? proxy : false,
	});
}
//end config
// main
async function getUserData(stt, axios, query)
{
	try{
		const headers = {
			Rawdata: query
		};

		const payload = {};

		const response = await axios.post('https://app.tabibot.com/api/user/sign-in', payload, { headers: headers });
		if (response && response.status == 200) {
			return response.data.user;
		}
		return null;
	}catch(e){
		console.log(`[*] Account ${stt} | getUserData err: ${e}`);
	}
}
async function getFarmInfo(stt, axios, query) {
	try {
		const headers = {
			Rawdata: query
		}
		const payload ={}
		const response = await axios.get('https://app.tabibot.com/api/mining/info', {headers})
		if (response && response.status == 200) {
			return response.data
		}
	} catch (e) {
		console.error(`[#] Account ${stt} | getFarmInfo error: ${e}`);
	}
}
async function claimFarm(stt, axios, query)
{
	try{
		const headers = {
			Rawdata: query
		};

		const payload = {};

		const response = await axios.post('https://app.tabibot.com/api/mining/claim', payload, { headers: headers });
		if (response && response.status == 200) {
			console.log(`[#] Account ${stt} | Claim farm successful`);
		}
	}catch(e){
		console.log(`[*] Account ${stt} | claimFarm err: ${e}`);
	}
}
async function upgrade(stt, axios, query, level)
{
	try{
		const headers = {
			Rawdata: query
		};

		const payload = {};

		const response = await axios.post('https://app.tabibot.com/api/user/level-up', payload, { headers: headers });
		if (response && response.status == 200 && response.data.level != level) {
			console.log(`[#] Account ${stt} | Upgrade successful level ${response.data.level}`);
		} 
	}catch(e){
		console.log(`[*] Account ${stt} | upgrade err: ${e}`);
	}
}
async function checkIn(stt, axios, query)
{
	try{
		const headers = {
			Rawdata: query
		};

		const payload = {};

		const response = await axios.post('https://app.tabibot.com/api/user/check-in', payload, { headers: headers });
		if (response && response.status == 200) {
			console.log(`[#] Account ${stt} | Checkin successful`);
		}
	}catch(e){
		console.log(`[*] Account ${stt} | checkIn err: ${e}`);
	}
}
//
async function main(stt, account, axios) {
	try {
		let urlData = querystring.unescape(account).split('tgWebAppData=')[1].split('&tgWebAppVersion')[0];
		console.log(cyan.bold(`[#] Account ${stt} | Login...`));
		await sleep(5);
		let uData = await getUserData(stt, axios, urlData);
		if(uData){
			console.log(blue.bold(`[#] Account ${stt} | ${uData.name} Balance: ${uData.coins}, Level: ${uData.level}`));
			if (!uData.hasCheckedIn) {
			 	await checkIn(stt, axios, urlData)
			}
			const farmInfo = await getFarmInfo(stt, axios, urlData)
			if (farmInfo) {
				const farmFinishAt = farmInfo.nextClaimTime
				const nextClaimTimeInSecond = farmInfo.nextClaimTimeInSecond
				if (!nextClaimTimeInSecond) {
					await claimFarm(stt, axios, urlData)
				} else {
					console.log(`[#] Account ${stt} | Có thể claim lúc ${formatTimeToUTC7(farmFinishAt)}`)
				}
			}
			if (uData.coins) {
				await upgrade(stt, axios, urlData, uData.level)
			}
			console.log(cyan.bold(`[#] Account ${stt} | Done!`));
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
			const maskedProxy = proxy?.slice(0, -10) + '**********';
			console.log(`[#] Account ${stt} | Proxy: ${maskedProxy}`);
			console.log(`[#] Account ${stt} | Check IP...`);
			let checkIp = await checkIP(axiosInstance);
			console.log(`[#] Account ${stt} | Run at IP: ${checkIp}`);
			await main(stt, account, axiosInstance);
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