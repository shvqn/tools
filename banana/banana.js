import querystring from 'querystring';
import { countdown, randomInt, sleep, getData, formatTimeToUTC7 } from './utils.js';
import { cyan, yellow, blue, green } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";

const accounts = getData("data_banana.txt");
const proxies = getData("proxy.txt");

let timeRerun = 8*60; //phút time nghỉ mỗi lượt chạy
let numberThread = 1; // số luồng chạy /1 lần 

const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MjIzOTc5NjYsImlhdCI6MTcyMTc5MzE2Niwic3ViIjoiNDAwMjc1NDQ3In0.L9K4u8Tm3ZBtzq1h_NIZEWG8sN5mVp732kMdRgyVKVQ"
// 

function createAxiosInstance(proxy) {
	return new AxiosHelpers({
		headers: {
			'accept': 'application/json, text/plain, */*',
			'accept-language': 'vi;q=0.8',
			'content-type': 'application/json',
			'origin': 'https://banana.carv.io',
			'priority': 'u=1, i',
			authorization: apiKey,
			'author': 'https://t.me/nauquu',
			'referer': 'https://banana.carv.io/',
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
		const headers ={}
		const payload = {
    		InviteCode: "",
			"tgInfo": query,
		}
		const response = await axios.post(`https://interface.carv.io/banana/login`, payload, {headers});
		if (response && response.status == 200) {
			return response.data.data.token;
		}
	}catch(e){
		console.log(`[Nauquu] Account ${stt} | getToken err: ${e}`);
	}
}
async function getUserData(stt, axios, token)
{
	try{
		const headers ={
			authorization: token,
		}
		const response = await axios.get(`https://interface.carv.io/banana/get_user_info`, {headers});
		if (response && response.status == 200) {
			return response.data.data;
		}
	}catch(e){
		console.log(`[Nauquu] Account ${stt} | getUserData err: ${e}`);
	}
}
async function click(stt, axios, token)
{
	try{
		const headers ={
			authorization: token,
		}
		const response = await axios.get(`https://interface.carv.io/banana/get_user_info`, {headers});
		if (response && response.status == 200) {
			return response.data.data;
		}
	}catch(e){
		console.log(`[Nauquu] Account ${stt} | click err: ${e}`);
	}
}
async function claimBanana(stt, axios, token)
{
	try{
		const headers ={
			authorization: token,
		}
		const response = await axios.get(``, {headers});
		if (response && response.status == 200) {
			return response.data.data;
		}
	}catch(e){
		console.log(`[Nauquu] Account ${stt} | claimBanana err: ${e}`);
	}
}
async function havest(stt, axios, token)
{
	try{
		const headers ={
			authorization: token,
		}
		const response = await axios.post(`https://interface.carv.io/banana/do_lottery`, {headers});
		if (response.data.code ==0 && response.status == 200) {
			console.log(blue.bold(`[Nauquu] Account ${stt} | Claim .....`));
		} else console.log(blue.bold(`[Nauquu] Account ${stt} | ${response.data.msg}`));
	}catch(e){
		console.log(`[Nauquu] Account ${stt} | havest err: ${e}`);
	}
}
async function getBananaList(stt, axios, token)
{
	try{
		const headers ={
			authorization: token,
		}
		const response = await axios.get(`https://interface.carv.io/banana/get_banana_list`, {headers});
		if (response && response.status == 200) {
			const bananaList = response.data.data.banana_list
			const bananaOwner = bananaList.filter(banana => banana.count)
			console.log(bananaOwner);
			const maxPeelBanana = bananaOwner.reduce((max, banana) => 
				banana.daily_peel_limit > max.daily_peel_limit ? banana : max, bananaOwner[0]);
			if (equip_banana_id != maxPeelBanana.banana_id) {
				await equipBanana(stt, axios, token)
			}
			console.log(blue.bold(`[Nauquu] Account ${stt} | Claim .....`));
		}
	}catch(e){
		console.log(`[Nauquu] Account ${stt} | getBananaList err: ${e}`);
	}
}
async function equipBanana(stt, axios, token)
{
	try{
		const headers ={
			authorization: token,
		}
		const response = await axios.post(`https://interface.carv.io/banana/do_lottery`, {headers});
		if (response.data.code ==0 && response.status == 200) {
			console.log(blue.bold(`[Nauquu] Account ${stt} | Claim .....`));
		} else console.log(blue.bold(`[Nauquu] Account ${stt} | ${response.data.msg}`));
	}catch(e){
		console.log(`[Nauquu] Account ${stt} | equipBanana err: ${e}`);
	}
}
//
async function main(stt, account, axios) {
	try {
		let urlData = querystring.unescape(account).split('tgWebAppData=')[1].split('&tgWebAppVersion')[0];
		const token = await getToken(stt, axios, urlData)
		if (token){
			const uData  = await getUserData(stt, axios, token)
			const {username, peel, usdt, max_click_count, today_click_count, lottery_info, equip_banana_id} = uData
			console.log(green.bold(`[Nauquu] Account ${stt} | User: ${username}, Balance: ${peel} peel, ${usdt} usdt, ${lottery_info.remain_lottery_count} banana, Taps: ${today_click_count}/${max_click_count}`));
			const nextClaimAt = new Date(lottery_info.last_countdown_start_time + lottery_info.countdown_interval*60*1000)
			if (lottery_info.countdown_end) {
				await claimBanana(stt, axios, token)
			} else console.log(yellow.bold(`[Nauquu] Account ${stt} | Can claim at ${formatTimeToUTC7(nextClaimAt)}`));
			if (today_click_count<max_click_count) {
				await click(stt,axios, token)
			}
			if (lottery_info.remain_lottery_count) {
				await havest(stt, axios, token)
			}
			await getBananaList(stt, axios, token)
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
			const axiosInstance = createAxiosInstance(proxy);
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
