import querystring from 'querystring';
import { countdown, randomInt, sleep, getData } from './utils.js';
import { cyan, yellow, blue, green } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";
import moment from 'moment-timezone';

const accounts = getData("data_arix.txt");
const proxies = getData("proxy.txt");

let timeRerun = 6*60; //phút time nghỉ mỗi lượt chạy
let numberThread = 1; // số luồng chạy /1 lần 

let auto_farm = true; // auto farm
let auto_claim_boxs = true; // auto claim box 
let auto_task = true; // auto task 
let auto_upgdate_spin = true; // auto update spin
let max_spin_level = 12; //max level spin
// 

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
			"Referrer-Policy": "strict-origin-when-cross-origin"
		},
		proxy: proxy ? proxy : false,
	});
}
function extractUserId(url) {
    const match = url.match(/[?&]id=(\d+)/);
    return match ? match[1] : null;
}
//end config
// main

async function getUserData(stt, userId, axios)
{
	try{
		const response = await axios.get(`https://miner-webapp-fz9k.vercel.app/api/user?id=${userId}`);
		if (response && response.status == 200) {
			return response.data;
		}
	}catch(e){
		console.log(`[*] Account ${stt} | getUserData err: ${e}`);
	}
}
async function claimFarm(stt, userId, axios)
{
	try{
		const response = await axios.get(`https://miner-webapp-fz9k.vercel.app/api/claim?id=${userId}`);
		if (response && response.status == 200) {
			console.log(blue.bold(`[#] Account ${stt} | Claimed farm, Balance ${response.data.balance} `));
		}
	}catch(e){
		console.log(`[*] Account ${stt} | claimFarm err: ${e}`);
	}
}

//
async function main(stt, account, axios) {
	try {
		// let urlData = querystring.unescape(account).split('tgWebAppData=')[1].split('&tgWebAppVersion')[0];
		const userId = extractUserId(account);

		console.log(cyan.bold(`[#] Account ${stt} | Login...`));
		await sleep(5);
		const uData = await getUserData(stt, userId, axios)
		if (uData) {
			console.log(green.bold(`[#] Account ${stt} | ${uData.last_name} ${uData.first_name} Balance: ${uData.balance}`));
			await claimFarm(stt, userId, axios)
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
mainLoopMutil();
