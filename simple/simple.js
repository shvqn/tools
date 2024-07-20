import { countdown, randomInt, sleep, getData } from './utils.js';
import { cyan, yellow, blue, green } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";

const accounts = getData("data_simple.txt");
const proxies = getData("proxy.txt");

let timeRerun = 8*60; //phút time nghỉ mỗi lượt chạy
let numberThread = 1; // số luồng chạy /1 lần 

// 

function createAxiosInstance(proxy) {
	return new AxiosHelpers({
		headers: {
			'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
            'Origin': 'https://simpletap.app',
            'Referer': 'https://simpletap.app/',
            'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
            'Sec-Ch-Ua-Mobile': '?1',
            'Sec-Ch-Ua-Platform': '"Android"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
		},
		proxy: proxy ? proxy : false,
	});
}

function spinType(type) {
    switch (type){
        case 0:
            return "TAP LIMIT"
        case 1:
            return "COINS PER HOUR"
        case 2:
            return "TAP SIZE"
        case 3:
            return "COINS"
    }
}
function formatTimeToUTC7(date) {
    // Tính giờ UTC+7 bằng cách cộng thêm 7 giờ vào thời gian hiện tại
    const utcOffset = 7; // UTC+7
    const utc7Date = new Date(date.getTime() + utcOffset * 60 * 60 * 1000);

    const hours = String(utc7Date.getUTCHours()).padStart(2, '0');
    const minutes = String(utc7Date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(utc7Date.getUTCSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}
function extractUserId(dataString) {
    const match = dataString.match(/id%22%3A(\d+)/);
    return match ? match[1] : null;
}
//end config
// main

async function getUserData(stt, user_id, query_id, axios)
{
	try{
		const headers = {};

		const payload = {
			"userId": user_id,
			"authData": query_id,
		};

		const response = await axios.post('https://api.simple.app/api/v1/public/telegram/profile/', payload, { headers: headers });

		if (response && response.status == 200) {
			return response.data.data;
		}
		return null;
	}catch(e){
		console.log(`[*] Account ${stt} | getUserData err: ${e}`);
		return null;
	}
}
async function claimFarm(stt, user_id, query_id, axios)
{
	try{
		const headers = {};

		const payload = {
			"userId": user_id,
			"authData": query_id,
		};

		const response = await axios.post('https://api.simple.app/api/v1/public/telegram/claim/', payload, { headers: headers });

		if (response && response.status == 200) {
			console.log(`[#] Account ${stt} | Claim farm thành công`);
		}
	}catch(e){
		console.log(`[*] Account ${stt} | claimFarm err: ${e}`);
	}
}
async function startFarm(stt, user_id, query_id, axios)
{
	try{
		const headers = {};

		const payload = {
			"userId": user_id,
			"authData": query_id,
		};

		const response = await axios.post('https://api.simple.app/api/v1/public/telegram/activate/', payload, { headers: headers });

		if (response && response.status == 200) {
			console.log(`[#] Account ${stt} | Start farm thành công`);
		}
	}catch(e){
		console.log(`[*] Account ${stt} | startFarm err: ${e}`);
	}
}
async function claimRef(stt, user_id, query_id, axios)
{
	try{
		const headers = {};

		const payload = {
			"userId": user_id,
			"authData": query_id,
		};

		const response = await axios.post('https://api.simple.app/api/v1/public/telegram/claim_friends/', payload, { headers: headers });

		if (response && response.status == 200) {
			console.log(`[#] Account ${stt} | Claim ref thành công`);
		}
	}catch(e){
		console.log(`[*] Account ${stt} | claimRef err: ${e}`);
	}
}
async function spin(stt, user_id, query_id, axios, spinCount)
{
	try{
		const headers = {};

		const payload = {
			"amount": 0,
			"userId": user_id,
			"authData": query_id,
		};

		const response = await axios.post('https://api.simple.app/api/v1/public/telegram/claim-spin/', payload, { headers: headers });

		if (response && response.status == 200) {
			console.log(`[#] Account ${stt} | Spin success ${response.data.data.amount} ${spinType(response.data.data.spinType)}`);
			if (spinCount > 1) {
                await spin(stt, user_id, query_id, axios, spinCount - 1)
            }
		}
	}catch(e){
		console.log(`[*] Account ${stt} | spin err: ${e}`);
	}
}
async function getMiningBlocks(stt, user_id, query_id, axios)
{
	try{
		const headers = {};

		const payload = {
			"userId": user_id,
			"authData": query_id,
		};

		const response = await axios.post('https://api.simple.app/api/v1/public/telegram/get-mining-blocks/', payload, { headers: headers });

		if (response && response.status == 200) {
			return response.data.data.mines
		}
	}catch(e){
		console.log(`[*] Account ${stt} | getMiningBlocks err: ${e}`);
	}
}
async function buyMiningBlocks(stt, user_id, query_id, axios, mineId, level)
{
	try{
		const headers = {};

		const payload = {
            "authData" : query_id,
            "level" : level,
            "mineId": mineId,
            "userId": user_id
		};

		const response = await axios.post('https://api.simple.app/api/v1/public/telegram/buy-mining-block/', payload, { headers: headers });
		if (response && response.status == 200) {
			console.log(`[#] Account ${stt} | Update Block ${mineId} Lv ${level}`);
			return true
		}
	}catch(e){
		// console.log(`[#] Account ${stt} | Lỗi update block ${mineId}: ${e.response.data.message}`);
		return false
	}
}
async function claimTaps(stt, user_id, query_id, axios, availableTaps, tapSize, balance)
{
	try{
		const headers = {};

		const payload = {
			"count": tapSize,
            "userId": user_id,
            "authData" : query_id,
		};

		const response = await axios.post('https://api.simple.app/api/v1/public/telegram/tap', payload, { headers: headers });

		if (response && response.status == 200) {
			console.log(`[#] Account ${stt} | AvailableTaps: ${availableTaps}, Balance: ${balance}`);
			if (availableTaps > tapSize) {
                await sleep(randomInt(0,2))
                await claimTaps(stt, user_id, query_id, axios, availableTaps - tapSize, tapSize, balance + tapSize);
            }
		}
	}catch(e){
		console.log(`[#] Account ${stt} | claimTaps error ${e}`);
	}
}
//
async function main(stt, account, axios) {
	try {
		// let urlData = querystring.unescape(account).split('tgWebAppData=')[1].split('&tgWebAppVersion')[0];
		let userId = extractUserId(account)
		console.log(cyan.bold(`[#] Account ${stt} | Login...`));
		await sleep(5);
		let uData = await getUserData(stt, userId, account, axios);
		if(uData){
			await sleep(5);
			const {balance, availableTaps, tapSize, spinCount, refBalance, activeFarmingSeconds} = uData;
        	console.log(`[#] Account ${stt} | Balance: ${balance}, AvailableTaps: ${availableTaps}, Spin: ${spinCount}, TapSize: ${tapSize}`);
			
			const now = new Date()
			const nowInMs = now.getTime()
			const farmStartedAtInMs = nowInMs - activeFarmingSeconds*1000
			const farmFinishAt = new Date(farmStartedAtInMs + 8*3600*1000)
			if (activeFarmingSeconds) {
				if (now >= farmFinishAt) {
					await claimFarm(stt, userId, account, axios)
					await startFarm(stt, userId, account, axios)
				} else console.log(`[#] Account ${stt} | Farm end at ${formatTimeToUTC7(farmFinishAt)} `)
			} else await startFarm(stt, userId, account, axios)

			if (availableTaps > tapSize) {
				await claimTaps(stt, userId, account, axios, availableTaps, tapSize, balance);
			}
			if (refBalance > 0) {
				await claimRef(stt, userId, account, axios)
			}
			if (spinCount > 0) {
				await spin(stt, userId, account, axios, spinCount)
			}

			const minesData = await getMiningBlocks(stt, userId, account, axios)
			let currBalance = balance;
			for (let block of minesData) {
				if (block.currentLevel < block.maxLevel && currBalance > block.nextPrice) {
					const res = await buyMiningBlocks(stt, userId, account, axios, block.mineId, block.currentLevel + 1);
					if (res) {
						currBalance = balance - block.nextPrice
					}
				}
			}
			
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
