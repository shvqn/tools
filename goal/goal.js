import querystring from 'querystring';
import { countdown, randomInt, sleep, getData, formatTimeToUTC7 } from './utils.js';
import { cyan, yellow, blue, green } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";

const accounts = getData("data_goal.txt");
const proxies = getData("proxy.txt");

let timeRerun = 60; //phút time nghỉ mỗi lượt chạy
let numberThread = 1; // số luồng chạy /1 lần 
let pointToExchange = 200000 //số bóng đạt đến để đổi qua usdt

// 

function createAxiosInstance(proxy, query) {
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
			"Referrer-Policy": "strict-origin-when-cross-origin",
			Authorization: query
		},
		proxy: proxy ? proxy : false,
	});
}
//end config
// main
async function getUserData(stt, axios)
{
	try{
		const response = await axios.get(`https://app.footballearn.com/v1/userpoint/state/`);
		if (response && response.status == 200) {
			return response.data;
		}
	}catch(e){
		console.log(`[@Nauquu] Account ${stt} | getUserData err: ${e}`);
	}
}
async function shotBall(stt, axios, ballId, userId)
{
	try{
		const payload ={
			uid: userId
		}
		const response = await axios.post(`https://app.footballearn.com/v1/goldenball/launch/${ballId}`,payload);
		if (response && response.status == 200) {
			console.log(yellow.bold(`[Nauquu] Account ${stt} | Shot goldenBall success`));
		}
	}catch(e){
		console.log(`[@Nauquu] Account ${stt} | shotBall err: ${e}`);
	}
}
async function exchange(stt, axios, point)
{
	try{
		const payload ={
			point: point
		}
		const response = await axios.post(`https://app.footballearn.com/v1/userpoint/exchange/`,payload);
		if (response && response.status == 200) {
			console.log(yellow.bold(`[Nauquu] Account ${stt} | Exchange success ${point} Ball to ${point/10000} Usdt`));
		}
	}catch(e){
		console.log(`[@Nauquu] Account ${stt} | exchange err: ${e}`);
	}
}
async function getRef(stt, axios)
{
	try{
		const response = await axios.get(`https://app.footballearn.com/v1/userinvite/state/`);
		if (response && response.status == 200) {
			const refList = response.data.events
			let count = 0
			for (const ref of refList) {
				if (ref.confirm_diamond < 0 && !ref.confirm){
					if (count == 10) break;
					const claimSuccess = await claimRef(stt, axios, ref.id)
					if (!claimSuccess) break; else count++
				}
			}
		}
	}catch(e){
		console.log(`[@Nauquu] Account ${stt} | get Ref err: ${e}`);
	}
}
async function claimRef(stt, axios, refId)
{
	try{
		const response = await axios.post(`https://app.footballearn.com/v1/event/confirm/${refId}`);
		if (response && response.status == 200) {
			console.log(cyan.bold(`[Nauquu] Account ${stt} | Claimed 2 diamonds from ref`));
			return true
		} else {
			console.log(green.bold(`[Nauquu] Account ${stt} |  ${response.data.message}`));
			return false
		}
	}catch(e){
		console.log(`[@Nauquu] Account ${stt} | claimRef err: ${e}`);
		console.log(e.response.data);
		return false
	}
}

//
async function main(stt, account, axios) {
	try {
		// let urlData = querystring.unescape(account).split('tgWebAppData=')[1].split('&tgWebAppVersion')[0];
		await sleep(5);
		const uData = await getUserData(stt, axios)
		if (uData) {
			const { first_name, diamond, goldenball, usdt, pointday, uid} = uData
			console.log(green.bold(`[Nauquu] Account ${stt} | User: ${first_name}, Diamond: ${diamond}, Usdt: ${usdt}, Ball: ${pointday.golden_value}`));
			if (goldenball) {
				for (let ball of goldenball) {
					await shotBall(stt, axios, ball.id, uid)
				}
			}
			if (pointday.golden_value > pointToExchange) {
				await exchange(stt, axios, pointToExchange)
			}
			await getRef(stt, axios)
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
			let query = querystring.unescape(account).split('tgWebAppData=')[1].split('&tgWebAppVersion')[0];
			const axiosInstance = createAxiosInstance(proxy, query);
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
