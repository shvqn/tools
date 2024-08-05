import querystring from 'querystring';
import { countdown, randomInt, sleep, getData, formatTimeToUTC7 } from './utils.js';
import { cyan, yellow, blue, green, red, gray } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";

const accounts = getData("data.txt");
const proxies = getData("proxy.txt");

let timeRerun = 4*60; //phút time nghỉ mỗi lượt chạy
let numberThread = 1; // số luồng chạy /1 lần 

function createAxiosInstance(proxy) {
	return new AxiosHelpers({
		headers: {
			'accept': 'application/json, text/plain, */*',
			'accept-language': 'vi;q=0.8',
			'content-type': 'application/json',
			'priority': 'u=1, i',
			'author': 'https://t.me/nauquu',
			'referer': 'https://tgapp.mhaya.online/',
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
};
//end config
// main
function getRollThreshold(remainder) {
	const thresholds = [50, 30, 20, 10, 5, 3, 2, 1];
	return thresholds.find(threshold => remainder >= threshold) || 0;
}
async function getUserData(stt, axios, id, name)
{
	try{
		const response = await axios.get(`https://tgapp.mhaya.online/api/robot/start?username=${id}&usernamemaybe=${name}`);
		if (response && response.status == 200) {
			return response.data.data;
		}
	}catch(e){
		console.log(red.bold(`[Nauquu.Mhaya] Account ${stt} | getUserData err: ${e}`));
		return null
	}
}
async function rolls(stt, axios, id, multiple)
{
	try{
		const response = await axios.get(`https://tgapp.mhaya.online/api/robot/roll?username=${id}&multiple=${multiple}`);
		if (response && response.status == 200) {
			console.log(green.bold(`[Nauquu.Mhaya] Account ${stt} | Roll Success, ${response.data.data.msg}` ));
		}
	}catch(e){
		console.log(red.bold(`[Nauquu.Mhaya] Account ${stt} | roll err: ${e}`));
		
	}
}
async function sign(stt, axios, id)
{
	try{
		const response = await axios.post(`https://tgapp.mhaya.online/api/robot/sign?username=${id}&signin=1`);
		if (response && response.status == 200) {
			console.log(green.bold(`[Nauquu.Mhaya] Account ${stt} | Checkin success, ${response.data.msg}` ));
		}
	}catch(e){
		if (e.response.status == 400){
			console.log(green.bold(`[Nauquu.Mhaya] Account ${stt} | ${e.response.data.msg}`));
		} else console.log(red.bold(`[Nauquu.Mhaya] Account ${stt} | sign err: ${e}`));
	}
}
async function jump(stt, axios, id, type)
{
	try{
		const response = await axios.post(`https://tgapp.mhaya.online/api/robot/jump?username=${id}&type=${type}`);
		if (response && response.status == 200) {
			console.log(green.bold(`[Nauquu.Mhaya] Account ${stt} | ${response.data.msg}, Claimed ${response.data.data.score} score, ${response.data.data.allroll} allroll, ${response.data.data.roll} roll` ));
		}
	}catch(e){
		console.log(red.bold(`[Nauquu.Mhaya] Account ${stt} | jump err: ${e}`));
	}
}
async function draw(stt, axios, id, multiple)
{
	try{
		const response = await axios.post(`https://tgapp.mhaya.online/api/robot/lotterys?username=${id}&multiple=${multiple}`);
		if (response && response.status == 200) {
			let point = 0
			let usdt = 0
			response.data.data.forEach(item => {
				if (item.prize_type === "Integral") {
					point += item.prize_number;
				} else if (item.prize_type === "U") {
					usdt += item.prize_number;
				}
			});
			console.log(green.bold(`[Nauquu.Mhaya] Account ${stt} | Draw ${multiple} times, Claimed ${point} points, ${usdt} usdt`));
		}
	}catch(e){
		console.log(red.bold(`[Nauquu.Mhaya] Account ${stt} | draw err: ${e}`));
	}
}

//
async function main(stt, account, axios) {
	try {
		// let urlData = querystring.unescape(account).split('tgWebAppData=')[1].split('&tgWebAppVersion')[0];
		const tgWebAppData = decodeURIComponent(account.split('#tgWebAppData=')[1]);
		const userParam = tgWebAppData.split('user=')[1].split('&')[0];
		const user = JSON.parse(decodeURIComponent(userParam));
		const userId = user.id;
		const username = user.username;
		const uData  = await getUserData(stt, axios, userId, username)
		if (uData){
			const {roll, score, all, drawsnumber, wall_u, userLevel} = uData
			console.log(blue.bold(`[Nauquu.Mhaya] Account ${stt} | User: ${username}, Balance: ${score}, Usdt: ${wall_u}, Roll: ${roll}/${all}, Draw: ${drawsnumber}`));
			await sign(stt, axios, userId)
			if (roll > 0) await rolls(stt, axios, userId, getRollThreshold(roll))
			for (const key in userLevel){
				if (userLevel[key] == 0) {
					const type = key.replace('jump','')
					await jump(stt, axios, userId, type)
				}
			}
			if (drawsnumber > 10) await draw(stt, axios, userId, Math.floor(drawsnumber/10))
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
			console.log(gray.bold(`[Nauquu.Mhaya] Account ${stt} | IP: ${checkIp}`));
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
		return `${ip} - ${country}`;
	} catch (err) {
		console.log(red.bold(`Error IP`));
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
