import querystring from 'querystring';
import { countdown, randomInt, sleep, getData } from './utils.js';
import { cyan, yellow, blue, green } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";

const accounts = getData("data_onux.txt");
const proxies = getData("proxy.txt");

let timeRerun = 4*60; //phút time nghỉ mỗi lượt chạy
let numberThread = 1; // số luồng chạy /1 lần 
// 

function createAxiosInstance(proxy) {
	return new AxiosHelpers({
		headers: {
			"accept": "*/*",
			"accept-language": "vi,vi-VN;q=0.9,fr-FR;q=0.8,fr;q=0.7,en;q=0.6",
			"content-type": "application/json",
			"priority": "u=1, i",
			"sec-ch-ua": "\"Google Chrome\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"",
            "Origin": "https://onx.goonus.io",
            "Referer": "https://onx.goonus.io/",
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
function formatTimeToUTC7(date) {
    // Tính giờ UTC+7 bằng cách cộng thêm 7 giờ vào thời gian hiện tại
    const utcOffset = 7; // UTC+7
    const utc7Date = new Date(date.getTime() + utcOffset * 60 * 60 * 1000);

    const hours = String(utc7Date.getUTCHours()).padStart(2, '0');
    const minutes = String(utc7Date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(utc7Date.getUTCSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}
async function getUserData(stt, data, axios)
{
	try{
		const headers = {}
		const payload = {
			"initData": data
		}
		const response = await axios.post(`https://bot-game.goonus.io/api/v1/me`, payload, {headers});
		if (response && response.status == 200) {
			return response.data;
		}
	}catch(e){
		console.log(`[*] Account ${stt} | getUserData err: ${e}`);
	}
}
async function getBalance(stt, data, axios)
{
	try{
		const headers = {}
		const payload = {
			"initData": data
		}
		const response = await axios.post(`https://bot-game.goonus.io/api/v1/points`, payload, {headers});
		if (response && response.status == 200) {
			return response.data.reduce((acc, item) => acc + item.amount, 0);
		}
	}catch(e){
		console.log(`[*] Account ${stt} | getBalance err: ${e}`);
	}
}
async function tap(stt, data, axios, clickCount)
{
	try{
		const headers = {}
		const payload = {
			"initData": data,
			"click": clickCount
		}
		const response = await axios.post(`https://bot-game.goonus.io/api/v1/claimClick`, payload, {headers});
		if (response && response.status == 200) {
			console.log(yellow.bold(`[#] Account ${stt} | Tap success`));
		}
	}catch(e){
		console.log(`[*] Account ${stt} | tap err: ${e}`);
	}
}
async function startFarm(stt, data, axios)
{
	try{
		const headers ={}
		const payload = {
			"initData": data,
		}
		const response = await axios.post(`https://bot-game.goonus.io/api/v1/startFarm`, payload, {headers});
		if (response && response.status == 200) {
			console.log(blue.bold(`[#] Account ${stt} | Started farm`));
		}
	}catch(e){
		console.log(`[*] Account ${stt} | startFarm err: ${e}`);
	}
}
async function claimFarm(stt, data, axios)
{
	try{
		const headers = {}
		const payload = {
			"initData": data,
		}
		const response = await axios.post(`https://bot-game.goonus.io/api/v1/claimFarm`, payload, {headers});
		if (response && response.status == 200) {
			console.log(blue.bold(`[#] Account ${stt} | Claimed farm`));
		}
	}catch(e){
		console.log(`[*] Account ${stt} | claimFarm err: ${e}`);
	}
}

//
async function main(stt, account, axios) {
	try {
		let urlData = querystring.unescape(account).split('tgWebAppData=')[1].split('&tgWebAppVersion')[0];

		console.log(cyan.bold(`[#] Account ${stt} | Login...`));
		await sleep(5);
		const uData = await getUserData(stt, urlData, axios)
		const balance = await getBalance(stt, urlData, axios)
		if (uData) {
			console.log(green.bold(`[#] Account ${stt} | User: ${uData.username}, Balance: ${balance}, Tap: ${uData.clickNumberLeft}`));
			if (uData.clickNumberLeft) {
				await tap(stt, urlData, axios, uData.clickNumberLeft)
			}
			if (uData.isClaimableFarming) {
				await claimFarm(stt, urlData, axios)
				await startFarm(stt, urlData, axios)
			} else {
				const farmEndAt = new Date(uData.lastFarmingTime + 4*3600*1000)
				console.log(green.bold(`[#] Account ${stt} | Farm end at ${formatTimeToUTC7(farmEndAt)}`));
			}
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
