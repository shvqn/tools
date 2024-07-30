import { countdown,  sleep, getData } from './utils.js';
import { cyan, yellow, blue, green, red } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";

const accounts = getData("token.txt");
const proxies = getData("proxy.txt");

let timeRerun = 4*60; //phút time nghỉ mỗi lượt chạy
let numberThread = 3; // số luồng chạy /1 lần 
// 

function createAxiosInstance(proxy) {
	return new AxiosHelpers({
		headers: {
			connection: "keep-alive",
			accept: "application/json, text/plain, */*",
			"user-agent":
				"Mozilla/5.0 (Linux; Android 10; Redmi 4A / 5A Build/QQ3A.200805.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.185 Mobile Safari/537.36",
			"content-type": "application/json",
			author: "https://t.me/nauquu",
			origin: "https://pepe.hivehubs.app",
			"x-requested-with": "tw.nekomimi.nekogram",
			"sec-fetch-site": "same-site",
			"sec-fetch-mode": "cors",
			"sec-fetch-dest": "empty",
			referer: "https://pepe.hivehubs.app",
			"accept-language": "en,en-US;q=0.9",
		},
		proxy: proxy ? proxy : false,
	});
}
//end config
// main
async function getUserData(stt, token, axios)
{
	try{
		const headers = {}
		const payload = {
			token: token,
			lang: "en",
			product_id: 1,
		}
		const response = await axios.post(`https://fission-api.hivehubs.app/api/user/info`, payload, {headers});
		if (response && response.status == 200) {
			return response.data.data;
		}
	}catch(e){
		console.log(`[Nauquu] Account ${stt} | getUserData err: ${e}`);
	}
}
async function claim(stt, token, axios, scene)
{
	try{
		const headers = {}
		const payload = {
			token: token,
			lang: "en",
			product_id: 1,
			"scene_type": scene
		}
		const response = await axios.post(`https://fission-api.hivehubs.app/api/scene/sync/scene`, payload, {headers});
		if (response && response.status == 200 && response.data.code == 0) {
			console.log(cyan.bold(`[Nauquu] Account ${stt} | Claim success scene ${scene+1}, Balance: ${response.data.data.assets.amounts.pepe} pepe`));
		} else console.log(red.bold(`[Nauquu] Account ${stt} | Claim error ${response.data.message}`));
	}catch(e){
		console.log(`[Nauquu] Account ${stt} | claim err: ${e}`);
	}
}
async function getFreeWithdrawData(stt, token, axios)
{
	try{
		const headers = {}
		const payload = {
			"a_type": "pepe",
			token: token,
			lang: "en",
			"product_id": 1
		}
		const response = await axios.post(`https://fission-api.hivehubs.app/api/withdraw/info`, payload, {headers});
		if (response && response.status == 200 && response.data.code == 0) {
			const freeWithdraw = response.data.data.info.lvs[0].day_count
			const limitFreeWithdraw = response.data.data.info.lvs[0].day_limit
			if (freeWithdraw < limitFreeWithdraw) {
				const address = await getAddress(stt, token, axios)
				if (address) await withdraw(stt, token, axios, address)
			}
		}
	}catch(e){
		console.log(`[Nauquu] Account ${stt} | getFreeWithdrawData err: ${e}`);
	}
}
async function getAddress(stt, token, axios)
{
	try{
		const headers = {}
		const payload = {
			token: token,
			lang: "en",
			"product_id": 1,
			chain: "bnb"
		}
		const response = await axios.post(`https://fission-api.hivehubs.app/api/platform/user/address`, payload, {headers});
		if (response && response.status == 200 && response.data.code == 0) {
			return response.data.data.address
		}
	}catch(e){
		console.log(`[Nauquu] Account ${stt} | getAddress err: ${e}`);
	}
}
async function withdraw(stt, token, axios, address)
{
	try{
		const headers = {}
		const payload = {
			token: token,
			lang: "en",
			"product_id": 1,
			chain: "bnb",
			"a_type": "pepe",
			address: address,
			"is_internal": true,
			"lv_index": 4
		}
		const response = await axios.post(`https://fission-api.hivehubs.app/api/withdraw/apply`, payload, {headers});
		if (response && response.status == 200 && response.data.code == 0) {
			console.log(green.bold(`[Nauquu] Account ${stt} | Daily withdraw`));
		}
	}catch(e){
		console.log(`[Nauquu] Account ${stt} | dailyWithdraw err: ${e}`);
	}
}
//
async function main(stt, account, axios) {
	try {
		console.log(cyan.bold(`[Nauquu] Account ${stt} | Login...`));
		await sleep(5);
		const uData = await getUserData(stt, account, axios)
		if (uData) {
			const amounts = uData.assets.amounts
			const scene = uData.scene.out_count
			console.log(green.bold(`[Nauquu] Account ${stt} | Pepe: ${amounts.pepe}, Diamond: ${amounts.diamond}`));
			for (let i=0; i<scene; i++) {
				await claim(stt, account, axios, i)
				await sleep(5*60)
			}
			if (amounts.pepe > 2000) await getFreeWithdrawData(stt, account, axios)
		}
		console.log(cyan.bold(`[Nauquu] Account ${stt} | Done!`));

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
    // let countPrx = proxies.length;
    // if(numberThread > countPrx) {
	// 		numberThread = countPrx
    // }
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
					console.log(`[Nauquu] Account ${stt} | IP: ${checkIp}`);
					await main(stt, account, axiosInstance);
				}
			})
	
		console.log(`[Nauquu] Thread: ${tasks.length} ...`);

		await Promise.all(tasks);
	}
}
async function checkIP(axios) {
	try {
			const rs = await axios.get("https://api.myip.com");
			await sleep(5)
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
			await countdown(timeRerun*60);
	}
}
mainLoopMutil();
