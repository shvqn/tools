import querystring from 'querystring';
import { countdown, randomInt, sleep, getData } from './utils.js';
import { cyan, yellow, blue, green } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";

const accounts = getData("data_pepe.txt");
const proxies = getData("proxy.txt");

let timeRerun = 5*60; //phút time nghỉ mỗi lượt chạy
let numberThread = 1; // số luồng chạy /1 lần 


function createAxiosInstance(proxy) {
	return new AxiosHelpers({
		headers: {
			"accept": "application/json, text/plain, */*",
			"accept-language": "vi,vi-VN;q=0.9,fr-FR;q=0.8,fr;q=0.7,en;q=0.6",
			"content-type": "application/json",
			"priority": "u=1, i",
			"sec-ch-ua": "\"Google Chrome\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"",
			"sec-ch-ua-mobile": "?0",
			"sec-ch-ua-platform": "\"Windows\"",
			"sec-fetch-dest": "empty",
			"sec-fetch-mode": "cors",
			"sec-fetch-site": "same-site",
			Origin: "https://pepe.hivehubs.app",
			"Referer": "https://pepe.hivehubs.app/",
			"Referrer-Policy": "strict-origin-when-cross-origin"
		},
		proxy: proxy ? proxy : false,
	});
}
//end config
// main

async function getUserData(stt, axios, urlData)
{
	try{
		const headers = {};

		const payload = {
			lang: "en",
			"product_id": 1,
			referrer: "",
			"init_data": urlData
		};

		const response = await axios.post('https://fission-api.hivehubs.app/api/login/tg', payload, { headers: headers });
		if (response && response.status == 200) {
			return response.data.data;
		}
		return null;
	}catch(e){
		console.log(`[*] Account ${stt} | getUserData err: ${e}`);
		return null;
	}
}

//
async function main(stt, account, axios) {
	try {
		let urlData = querystring.unescape(account).split('tgWebAppData=')[1].split('&tgWebAppVersion')[0];

		console.log(cyan.bold(`[#] Account ${stt} | Login...`));
		await sleep(5);
		let uData = await getUserData(stt, axios, urlData);
		if (uData) {
			const amounts = uData.assets.amounts
			const diamond = amounts['diamond'] ? amounts['diamond'].amount : 0;
            const pepe = amounts['pepe'] ? amounts['pepe'].amount : 0;
			console.log(`[#] Account ${stt} | Balance: ${pepe} pepe, ${diamond} 💎`)
			const floor = uData.scene.scenes
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
mainLoopMutil();
