import querystring from 'querystring';
import { countdown, randomInt, sleep, getData } from './utils.js';
import { cyan, yellow, blue, green } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";
import moment from 'moment-timezone';

const accounts = getData("data_cryptorank.txt");
const proxies = getData("proxy.txt");

let timeRerun = 6*60; //phút time nghỉ mỗi lượt chạy
let numberThread = 1; // số luồng chạy /1 lần 

// 
function formatTimeToUTC7(date) {
    const utcOffset = 7; // UTC+7
    const utc7Date = new Date(date.getTime() + utcOffset * 60 * 60 * 1000);

    const hours = String(utc7Date.getUTCHours()).padStart(2, '0');
    const minutes = String(utc7Date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(utc7Date.getUTCSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

function createAxiosInstance(proxy, token) {
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
			Authorization: token
		},
		proxy: proxy ? proxy : false,
	});
}
//end config
// main
async function getUserData(stt, axios)
{
	try{
		const headers = {};

		const payload = {};

		const response = await axios.get('https://api.cryptorank.io/v0/tma/account', payload, { headers: headers });
		if (response && response.status == 200) {
			return response.data;
		}
		return null;
	}catch(e){
		console.log(`[*] Account ${stt} | getUserData err: ${e}`);
		return null;
	}
}
async function claimFarm(stt, axios)
{
	try{
		const headers = {};

		const payload = {};

		const response = await axios.post('https://api.cryptorank.io/v0/tma/account/end-farming', payload, { headers: headers });
		if (response && response.status == 201) {
			console.log(`[#] Account ${stt} | Claim farm successful, Balance: ${response.data.balance
			}`);
		}
	}catch(e){
		console.log(`[*] Account ${stt} | claimFarm err: ${e}`);
		return null;
	}
}
async function startFarm(stt, axios)
{
	try{
		const headers = {};

		const payload = {};

		const response = await axios.post('https://api.cryptorank.io/v0/tma/account/start-farming', payload, { headers: headers });
		if (response && response.status == 201) {
			console.log(`[#] Account ${stt} | Start farm successful`);
		}
	}catch(e){
		console.log(`[*] Account ${stt} | startFarm err: ${e}`);
		return null;
	}
}
async function getRef(stt, axios)
{
	try{
		const headers = {};

		const payload = {};

		const response = await axios.get('https://api.cryptorank.io/v0/tma/account/buddies', payload, { headers: headers });
		if (response && response.status == 200) {
			if (!response.data.cooldown && response.data.reward){
				await claimRef(stt, axios)
			}
		}
	}catch(e){
		console.log(`[*] Account ${stt} | getRef err: ${e}`);
	}
}
async function claimRef(stt, axios)
{
	try{
		const headers = {};

		const payload = {};

		const response = await axios.get('https://api.cryptorank.io/v0/tma/account/claim/buddies', payload, { headers: headers });
		if (response && response.status == 200) {
			console.log(yellow.bold(`[#] Account ${stt} | Claim Ref success, Balance: ${response.data.balance}`));
		}
	}catch(e){
		console.log(`[*] Account ${stt} | claimRef err: ${e}`);
	}
}
async function getTask(stt, axios, balance)
{
	try{
		const headers = {};

		const response = await axios.get('https://api.cryptorank.io/v0/tma/account/tasks', { headers: headers });

		if (response && response.status == 200) {
			let taskList = response.data
			taskList = taskList.filter(task => task.type != "main_buddy")
			for (let task of taskList) {
				const now = new Date()
				const nextClaimRepeatTask = new Date(task.lastClaim + task.cooldown*1000)
				if (task.type == 'main_points'&&balance>task.reward*10&&!task.lastClaim) {
					console.log(task);
					await claimTask(stt, axios, task.id)
				}
				if (!task.lastClaim&&task.type !== 'main_points') {
					console.log(task);
					await claimTask(stt, axios, task.id)
				}
				if (task.isRepeatable && now>=nextClaimRepeatTask) {
					console.log(task);
					await claimTask(stt, axios, task.id)
				}
			}
		}
	}catch(e){
		console.log(`[*] Account ${stt} | getTask err: ${e}`);
	}
}
async function claimTask(stt, axios, taskId)
{
	try{
		const headers = {};

		const response = await axios.post(`https://api.cryptorank.io/v0/tma/account/claim/task/${taskId}`, { headers: headers });
		if (response && response.status == 201) {
			console.log(green.bold(`[#] Account ${stt} | Claim task success, Balance: ${response.data.balance}`));
		}
	}catch(e){
		console.log(`[*] Account ${stt} | claimTask err: ${e}`);
	}
}
//
async function main(stt, axios) {
	try {
		console.log(cyan.bold(`[#] Account ${stt} | Login...`));
		await sleep(5);
		let uData = await getUserData(stt, axios);
		if(uData){
			console.log(blue.bold(`[#] Account ${stt} | Balance: ${uData.balance}`));
			const now = new Date()
			const farmFinishAt = new Date(uData.farming.timestamp + 6*3600*1000)
			if (farmFinishAt && now >= farmFinishAt) {
                await claimFarm(stt, axios);
                await startFarm(stt, axios);
			} else {
				console.log(`[#] Account ${stt} | Có thể claim lúc ${formatTimeToUTC7(farmFinishAt)}`)
			}
			await getTask(stt, axios, uData.balance)
			await getRef(stt, axios)
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
mainLoopMutil()