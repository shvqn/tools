import querystring from 'querystring';
import { countdown, randomInt, sleep, getData, formatTimeToUTC7 } from './utils.js';
import { cyan, yellow, blue, green } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";

const accounts = getData("data_blum.txt");
const proxies = getData("proxy.txt");

let timeRerun = 8*60; //phút time nghỉ mỗi lượt chạy
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
			"Origin": "https://telegram.blum.codes",
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
			"Authorization": ``,
		}
		const payload = {
			query: query
		}
		const response = await axios.post("https://gateway.blum.codes/v1/auth/provider/PROVIDER_TELEGRAM_MINI_APP",payload, {headers});
		if (response && response.status == 200) {
			return response.data.token;
		}
	}catch(e){
		console.log(`[@Nauquu] Account ${stt} | getToken err: ${e}`);
	}
}
async function getUserData(stt, axios, token)
{
	try{
		const headers = {
			"Authorization": `Bearer ${token}`,
		}
		const response = await axios.get("https://game-domain.blum.codes/api/v1/user/balance", {headers});
		if (response && response.status == 200) {
			return response.data;
		}
	}catch(e){
		console.log(`[@Nauquu] Account ${stt} | getUserData err: ${e}`);
	}
}
async function claimFarm(stt, axios, token)
{
	try{
		const headers = {
			"Authorization": `Bearer ${token}`,
		}
		const response = await axios.post(`https://game-domain.blum.codes/api/v1/farming/claim`, {headers});
		if (response && response.status == 200) {
			console.log(blue.bold(`[@Nauquu] Account ${stt} | Claim farm success `));
		}
	}catch(e){
		console.log(`[@Nauquu] Account ${stt} | claimFarm err: ${e}`);
	}
}
async function startFarm(stt, axios, token)
{
	try{
		const headers = {
			"Authorization": `Bearer ${token}`,
		}
		const response = await axios.post(`https://game-domain.blum.codes/api/v1/farming/start`, {headers});
		if (response && response.status == 200) {
			console.log(blue.bold(`[@Nauquu] Account ${stt} | Start farm success `));
		}
	}catch(e){
		console.log(`[@Nauquu] Account ${stt} | startFarm err: ${e}`);
	}
}
async function getRef(stt, axios, token)
{
	try{
		const headers = {
			"Authorization": `Bearer ${token}`,
		}
		const response = await axios.get(`https://gateway.blum.codes/v1/friends/balance`, {headers});
		if (response && response.status == 200 && response.data.canClaim ) {
			await claimRef(stt, axios, token)
		}
	}catch(e){
		console.log(`[@Nauquu] Account ${stt} | getRef err: ${e}`);
	}
}
async function claimRef(stt, axios, token)
{
	try{
		const headers = {
			"Authorization": `Bearer ${token}`,
		}
		const response = await axios.post(`https://gateway.blum.codes/v1/friends/claim`, {}, {headers});
		if (response && response.status == 200) {
			console.log(blue.bold(`[@Nauquu] Account ${stt} | Claim ref success, Balance =+ ${response.data.claimBalance} `));
		}
	}catch(e){
		console.log(`[@Nauquu] Account ${stt} | claimRef err: ${e}`);
	}
}
async function playGame(stt, axios, token)
{
	try{
		const headers = {
			"Authorization": `Bearer ${token}`,
		}
		const response = await axios.post(`https://game-domain.blum.codes/api/v1/game/play`,{}, {headers});
		if (response && response.status == 200) {
			console.log(blue.bold(`[@Nauquu] Account ${stt} | Playing game...`));
			await sleep(31)
			await claimGame(stt, axios, token, response.data.gameId)
		}
	}catch(e){
		console.log(`[@Nauquu] Account ${stt} | playGame err: ${e.response.data.message}`);
	}
}
async function claimGame(stt, axios, token, gameId)
{
	try{
		const headers = {
			"Authorization": `Bearer ${token}`,
		}
		const point = randomInt(150,250)
		const payload = {
			"gameId": gameId,
			"point": point
		}
		const response = await axios.post(`https://game-domain.blum.codes/api/v1/game/claim`,payload, {headers});
		console.log(response);
		if (response && response.status == 200) {
			console.log(blue.bold(`[@Nauquu] Account ${stt} | Claim game, Balance =+ ${payload.point}`));
		}
	}catch(e){
		console.log(`[@Nauquu] Account ${stt} | claimGame err: ${e}`);
	}
}

//
async function main(stt, account, axios) {
	try {
		let urlData = querystring.unescape(account).split('tgWebAppData=')[1].split('&tgWebAppVersion')[0];
		const tokenData = await getToken(stt, axios, urlData)
		const token = tokenData.access
		const username = tokenData.user.username
		await sleep(5);
		const uData = await getUserData(stt, axios, token)
		if (uData) {
			let {availableBalance, playPasses, farming} = uData
			console.log(green.bold(`[@Nauquu] Account ${stt} | User: ${username}, Balance: ${availableBalance}, PlayPasses: ${playPasses}`));
			const now = new Date()
			const farmFinishAt = new Date(farming.endTime)
			if (now > farmFinishAt) {
				await claimFarm(stt,axios,token)
				await startFarm(stt,axios,token)
			} else console.log(green.bold(`[@Nauquu] Account ${stt} | Farm end at ${formatTimeToUTC7(farmFinishAt)}`));
			await getRef(stt, axios, token)
			while (playPasses) {
				await playGame(stt, axios, token)
				playPasses--
			}
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
