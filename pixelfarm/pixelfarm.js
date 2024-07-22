import querystring from 'querystring';
import { countdown, randomInt, sleep, getData, formatTimeToUTC7 } from './utils.js';
import { cyan, yellow, blue, green } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";

const accounts = getData("data_pixel.txt");
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
			"Origin": "https://pixelfarm.app",
			"Referer": "https://pixelfarm.app/",
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
async function getToken(stt, axios, query)
{
	try{
		const headers = {
		}
		const payload = {
			"auth_data": query
		}
		const response = await axios.get(`https://api.pixelfarm.app/user/login?auth_data=${query}`,{}, {headers});
		if (response && response.status == 200) {
			return response.data.data;
		}
	}catch(e){
		console.log(`[@Nauquu] Account ${stt} | getToken err: ${e}`);
		console.log(e.response.d);
	}
}
async function getUserData(stt, axios, token)
{
	try{
		const headers = {
			Authorization: `Bearer ${token}`
		}
		const response = await axios.get(`https://api.pixelfarm.app/user`, {headers});
		if (response && response.status == 200) {
			return response.data.data;
		}
	}catch(e){
		console.log(`[@Nauquu] Account ${stt} | getUserData err: ${e}`);
	}
}
async function claimFarm(stt, axios, token)
{
	try{
		const headers = {
			Authorization: `Bearer ${token}`
		}
		const response = await axios.post(`https://api.pixelfarm.app/user/claim`,{}, {headers});
		if (response && response.status == 201) {
			console.log(blue.bold(`[@Nauquu] Account ${stt} | ${response.data.messages}`));
		}
	}catch(e){
		console.log(`[@Nauquu] Account ${stt} | claimFarm err: ${e}`);
	}
}
async function getTask(stt, axios, token, userId)
{
	try{
		const headers = {
			Authorization: `Bearer ${token}`
		}
		const response = await axios.get(`https://api.pixelfarm.app/user/${userId}/quests`,{}, {headers});
		if (response && response.status == 200) {
			const taskList = response.data.data.filter(item => !item.name.includes("Invite"));
			for (let task of taskList) {
				if (!task.done_at){
					await claimTask(stt, axios, token, task.quest_id)
				}
			}
		}
	}catch(e){
		console.log(`[@Nauquu] Account ${stt} | getTask err: ${e}`);
	}
}
async function claimTask(stt, axios, token, questId)
{
	try{
		const headers = {
			Authorization: `Bearer ${token}`
		}
		const payload = {
			"quest_id": questId
		}
		const response = await axios.put(`https://api.pixelfarm.app/user/user-quest`,payload, {headers});
		if (response && response.status == 200) {
			console.log(blue.bold(`[@Nauquu] Account ${stt} | ${response.data.messages}`));
		}
	}catch(e){
		console.log(`[@Nauquu] Account ${stt} | claimTask err: ${e.response.data.message}`);
	}
}

//
async function main(stt, account, axios) {
	try {
		// let urlData = querystring.unescape(account).split('tgWebAppData=')[1].split('&tgWebAppVersion')[0];
		let urlData= account.split('#tgWebAppData=')[1].split('&')[0];
		const token = await getToken(stt, axios, urlData)
		await sleep(5);
		const uData = await getUserData(stt, axios, token)
		if (uData) {
			const cropsData = uData.crops
			console.log(green.bold(`[@Nauquu] Account ${stt} | User: ${uData.telegram_username}, Balance: ${cropsData[0].fruit_total}`));
			await claimFarm(stt, axios, token)
			await getTask(stt, axios, token, uData.telegram_id)
		console.log(cyan.bold(`[@Nauquu] Account ${stt} | Done!`));
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
			console.log(`[@Nauquu] Account ${stt} | Run at IP: ${checkIp}`);
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
