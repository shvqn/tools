import querystring from 'querystring';
import { countdown, randomInt, sleep, getData, formatTimeToUTC7 } from './utils.js';
import { cyan, yellow, blue, green, magenta, gray, red, redBG } from 'console-log-colors';
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
		console.log(red.bold(`[Nauquu.Banana] Account ${stt} | getToken err: ${e}`));
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
		console.log(red.bold(`[Nauquu.Banana] Account ${stt} | getUserData err: ${e}`));
	}
}
async function click(stt, axios, token, count)
{
	try{
		const headers ={
			authorization: token,
		}
		const payload = {
			clickCount: count
		}
		const response = await axios.post(`https://interface.carv.io/banana/do_click`,payload, {headers});
		if (response && response.status == 200) {
			console.log(green.bold(`[Nauquu.Banana] Account ${stt} | Clicked earn ${response.data.data.peel} peel`));
		}
	}catch(e){
		console.log(red.bold(`[Nauquu.Banana] Account ${stt} | click err: ${e}`));
	}
}
async function claimBanana(stt, axios, token)
{
	try{
		const headers ={
			authorization: token,
		}
		const payload = {
			claimLotteryType: 1
		}
		const response = await axios.post(`https://interface.carv.io/banana/claim_lottery`, payload, {headers});
		if (response && response.status == 200) {
			return response.data.data;
		}
	}catch(e){
		console.log(red.bold(`[Nauquu.Banana] Account ${stt} | claimBanana err: ${e}`));
	}
}
async function havest(stt, axios, token)
{
	try{
		const headers ={
			authorization: token,
		}
		const response = await axios.post(`https://interface.carv.io/banana/do_lottery`,{}, {headers});
		if (response.data.code ==0 && response.status == 200) {
			console.log(blue.bold(`[Nauquu.Banana] Account ${stt} | Claimed ${response.data.data.name} ${response.data.data.daily_peel_limit} peel`));
			await doShare(stt, axios, token, response.data.data.banana_id)
		} else console.log(blue.bold(`[Nauquu.Banana] Account ${stt} | ${response.data.msg}`));
	}catch(e){
		console.log(red.bold(`[Nauquu.Banana] Account ${stt} | havest err: ${e}`));
		console.log(e.response.data);
	}
}
async function doShare(stt, axios, token, bananaId)
{
	try{
		const headers ={
			authorization: token,
		}
		const payload = {
			"banana_id": bananaId,
		}
		const response = await axios.post(`https://interface.carv.io/banana/do_share`,payload, {headers});
		if (response.data.code ==0 && response.status == 200) {
			console.log(blue.bold(`[Nauquu.Banana] Account ${stt} | Share ${response.data.msg}, Claimed ${response.data.data.peel} peel`));
		}
	}catch(e){
		console.log(red.bold(`[Nauquu.Banana] Account ${stt} | doShare err: ${e}`));
	}
}
async function getBananaList(stt, axios, token, equip_banana_id)
{
	try{
		const headers ={
			authorization: token,
		}
		const response = await axios.get(`https://interface.carv.io/banana/get_banana_list`, {headers});
		if (response && response.status == 200) {
			const bananaList = response.data.data.banana_list
			const bananaOwner = bananaList.filter(banana => banana.count)
			const maxPeelBanana = bananaOwner.reduce((max, banana) => {
				if (banana.sell_exchange_usdt > 0) {
					console.log(redBG.green.bold(`[Nauquu.Banana] Account ${stt} | ${banana.count} Banana ${banana.name} Price: ${banana.sell_exchange_usdt}`));
				}
				return banana.daily_peel_limit > max.daily_peel_limit ? banana : max, bananaOwner[0];
			})
			if (equip_banana_id != maxPeelBanana.banana_id) {
				await equipBanana(stt, axios, token, maxPeelBanana.banana_id, maxPeelBanana.name)
			}
		}
	}catch(e){
		console.log(red.bold(`[Nauquu.Banana] Account ${stt} | getBananaList err: ${e}`));
	}
}
async function equipBanana(stt, axios, token, id, name)
{
	try{
		const headers ={
			authorization: token,
		}
		const payload ={
			bananaId: id
		}
		const response = await axios.post(`https://interface.carv.io/banana/do_equip`,payload, {headers});
		if (response && response.status == 200) {
			console.log(cyan.bold(`[Nauquu.Banana] Account ${stt} | Equip banana ${name}`));
		}
	}catch(e){
		console.log(red.bold(`[Nauquu.Banana] Account ${stt} | equipBanana err: ${e}`));
	}
}
async function getQuestList(stt, axios, token)
{
	try{
		const headers ={
			authorization: token,
		}
		const response = await axios.get(`https://interface.carv.io/banana/get_quest_list`, {headers});
		if (response && response.status == 200) {
			const questList = response.data.data.quest_list
			const availableQuest = questList
				.filter(quest => !quest.is_claimed)
				.filter(quest => !quest.quest_name.includes('Bind'))
			if (availableQuest){
				for (const quest of availableQuest) {
					if (!quest.is_achieved) await startQuest(stt, axios, token, quest.quest_id, quest.quest_name)
					await claimQuest(stt, axios, token, quest.quest_id)
				}
			}
			if (response.data.data.is_claimed) await claimQuestBanana(stt, axios, token)
		}
	}catch(e){
		console.log(red.bold(`[Nauquu.Banana] Account ${stt} | getQuestList err: ${e}`));
	}
}
async function startQuest(stt, axios, token, id, name)
{
	try{
		const headers ={
			authorization: token,
		}
		const payload ={
			"quest_id": id
		}
		const response = await axios.post(`https://interface.carv.io/banana/achieve_quest`,payload, {headers});
		if (response && response.status == 200) {
			console.log(magenta.bold(`[Nauquu.Banana] Account ${stt} | Start ${name}`));
		}
	}catch(e){
		console.log(red.bold(`[Nauquu.Banana] Account ${stt} | startQuest err: ${e}`));
	}
}
async function claimQuest(stt, axios, token, id)
{
	try{
		const headers ={
			authorization: token,
		}
		const payload ={
			"quest_id": id
		}
		const response = await axios.post(`https://interface.carv.io/banana/claim_quest`,payload, {headers});
		if (response && response.status == 200) {
			console.log(magenta.bold(`[Nauquu.Banana] Account ${stt} | Claimed ${response.data.data.peel} peel`));
		}
	}catch(e){
		console.log(red.bold(`[Nauquu.Banana] Account ${stt} | claimQuest err: ${e}`));
	}
}
async function claimQuestBanana(stt, axios, token)
{
	try{
		const headers ={
			authorization: token,
		}
		const response = await axios.post(`https://interface.carv.io/banana/claim_quest_lottery`,{} ,{headers});
		if (response && response.status == 200) {
			console.log(magenta.bold(`[Nauquu.Banana] Account ${stt} | Claimed 1 banana from quest`));
		}
	}catch(e){
		console.log(red.bold(`[Nauquu.Banana] Account ${stt} | claimQuestBanana err: ${e}`));
	}
}
async function getRefList(stt, axios, token)
{
	try{
		const headers ={
			authorization: token,
		}
		const response = await axios.get(`https://interface.carv.io/banana/get_invite_list?pageNum=1&pageSize=200`, {headers});
		if (response.data.claim_lottery_count > 0 && response.status == 200) {
			for (let i = 0; i<response.data.claim_lottery_count; i++) {
				await claimRef(stt, axios, token)
			}
		}
	}catch(e){
		console.log(red.bold(`[Nauquu.Banana] Account ${stt} | getRefList err: ${e}`));
	}
}
async function claimRef(stt, axios, token)
{
	try{
		const headers ={
			authorization: token,
		}
		const payload = {
			claimLotteryType: 2
		}
		const response = await axios.post(`https://interface.carv.io/banana/claim_lottery`,payload ,{headers});
		if (response && response.status == 200) {
			console.log(cyan.bold(`[Nauquu.Banana] Account ${stt} | Claimed 1 banana from ref`));
		}
	}catch(e){
		console.log(red.bold(`[Nauquu.Banana] Account ${stt} | claimRef err: ${e}`));
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
			console.log(green.bold(`[Nauquu.Banana] Account ${stt} | User: ${username}, Balance: ${peel} peel, ${usdt} usdt, ${lottery_info.remain_lottery_count} banana, Taps: ${today_click_count}/${max_click_count}`));
			const nextClaimAt = new Date(lottery_info.last_countdown_start_time + lottery_info.countdown_interval*60*1000)
			if (lottery_info.countdown_end) {
				await claimBanana(stt, axios, token)
			} else console.log(yellow.bold(`[Nauquu.Banana] Account ${stt} | Can claim at ${formatTimeToUTC7(nextClaimAt)}`));
			if (today_click_count<max_click_count) {
				await click(stt,axios, token, max_click_count-today_click_count)
			}
			await getRefList(stt, axios, token)
			await getQuestList(stt, axios, token)
			for (let i = 0; i< lottery_info.remain_lottery_count; i++) {
				await havest(stt, axios, token)
			}
			await getBananaList(stt, axios, token, equip_banana_id)
			console.log(cyan.bold(`[Nauquu.Banana] Account ${stt} | Done!`));
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
			console.log(gray.bold(`[Nauquu.Banana] Account ${stt} | IP: ${checkIp}`));
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
