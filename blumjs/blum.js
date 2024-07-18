import querystring from 'querystring';
import { countdown, randomInt, sleep, getData } from './utils.js';
import { cyan, yellow, blue, green } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";
import moment from 'moment-timezone';

const accounts = getData("data_blum.txt");
const proxies = getData("proxy.txt");

let timeRerun = 8*60; //phút time nghỉ mỗi lượt chạy
let numberThread = 1; // số luồng chạy /1 lần 

// 

function createAxiosInstance(proxy, account) {
	return new AxiosHelpers({
		headers: {
			"accept": "*/*",
			"accept-language": "vi,vi-VN;q=0.9,fr-FR;q=0.8,fr;q=0.7,en;q=0.6",
			"content-type": "application/json",
			"priority": "u=1, i",
			"sec-ch-ua": "\"Google Chrome\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"",
			"Origin": "https://telegram.blum.codes",
			"Authorization": `Bearer ${account}`,
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
//end config
// main
async function getUserData(stt, axios)
{
	try{
		const response = await axios.get("https://game-domain.blum.codes/api/v1/user/balance");
		if (response && response.status == 200) {
			return response.data;
		}
	}catch(e){
		console.log(`[*] Account ${stt} | getUserData err: ${e}`);
		console.log(e.response);
	}
}
async function getBalance(stt, axios)
{
	try{
		const headers = {
		}
		const response = await axios.get(`https://game-domain.blum.codes/api/v1/user/balance`, {headers});
		if (response && response.status == 200) {
			console.log(blue.bold(`[#] Account ${stt} | Claimed farm, Balance ${response.data.balance} `));
		}
	}catch(e){
		console.log(`[*] Account ${stt} | getBalance err: ${e}`);
		console.log(e.response.data);
	}
}
async function claimFarm(stt, userId, axios)
{
	try{
		const payload = {
			id: userId
		}
		const response = await axios.post(`https://miner-webapp-fz9k.vercel.app/api/claim?id=${userId}`);
		if (response && response.status == 200) {
			console.log(blue.bold(`[#] Account ${stt} | Claimed farm, Balance ${response.data.balance} `));
		}
	}catch(e){
		console.log(`[*] Account ${stt} | claimFarm err: ${e}`);
	}
}

//
async function main(stt, axios) {
	try {
		// let urlData = querystring.unescape(account).split('tgWebAppData=')[1].split('&tgWebAppVersion')[0];
		// const userId = extractUserId(account);

		console.log(cyan.bold(`[#] Account ${stt} | Login...`));
		await sleep(5);
		const uData = await getUserData(stt, axios)
		console.log(uData);
		// if (uData) {
		// 	console.log(green.bold(`[#] Account ${stt} | ${uData.last_name} ${uData.first_name} Balance: ${uData.balance}`));
		// 	await claimFarm(stt, userId, axios)
		// }
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
			const axiosInstance = createAxiosInstance(proxy, account);
			let stt = Number(globalIndex) + Number(1);
			const maskedProxy = proxy?.slice(0, -10) + '**********';
			console.log(`[#] Account ${stt} | Proxy: ${maskedProxy}`);
			console.log(`[#] Account ${stt} | Check IP...`);
			let checkIp = await checkIP(axiosInstance);
			console.log(`[#] Account ${stt} | Run at IP: ${checkIp}`);
			await main(stt, axiosInstance);
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
