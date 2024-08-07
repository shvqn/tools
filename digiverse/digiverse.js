import querystring from 'querystring';
import { countdown, randomInt, sleep, getData } from './utils.js';
import { cyan, yellow, blue, green, red, gray, magenta } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";
import url from 'url'


const accounts = getData("data.txt");
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
            "Origin": "https://tgapp.digibuy.io",
            "Referer": "https://tgapp.digibuy.io/",
			"sec-ch-ua-mobile": "?0",
			"sec-ch-ua-platform": "\"Windows\"",
			"sec-fetch-dest": "empty",
			"sec-fetch-mode": "cors",
			"sec-fetch-site": "same-site",
			"Referrer-Policy": "strict-origin-when-cross-origin"
		},
		proxy:  proxy ? proxy : false,
	});
}
//end config
// main
function formatTimeToUTC7(date) {
    const utcOffset = 7; // UTC+7
    const utc7Date = new Date(date.getTime() + utcOffset * 60 * 60 * 1000);

    const hours = String(utc7Date.getUTCHours()).padStart(2, '0');
    const minutes = String(utc7Date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(utc7Date.getUTCSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}
async function login(stt, data, axios)
{
	try{ 
        const headers = {};
		const payload = data
		const response = await axios.post(`https://tgapp-api.digibuy.io/api/tgapp/v1/user/login`, payload, {headers});
		if (response && response.status == 200) {
			return response.data.data.token;
		} else return null
	}catch(e){
		console.log(`[*] Account ${stt} | login err: ${e}`);
		return null
	}
}
async function getStatus(stt, axios, token) {
	try{ 
        const headers = {
			authorization: token
		};
		const response = await axios.get(`https://tgapp-api.digibuy.io/api/tgapp/v1/daily/task/status`, {headers});
		if (response && response.status == 200) {
			const statusList = response.data.data
			for (const boost of statusList) {
				if (boost.current_count < boost.task_count) await buyBoost(stt, axios, token, id, type)
			}
		} 
	}catch(e){
		console.log(`[*] Account ${stt} | getStatus err: ${e}`);
	}
}
async function getReward(stt, axios, token, id) {
	try{ 
        const headers = {
			authorization: token
		};
		const payload = {
			uid: id
		}
		const response = await axios.post(`https://tgapp-api.digibuy.io/api/tgapp/v1/point/reward`, payload, {headers});
		if (response && response.status == 200) {
			if (response.data.data.next_claim_timestamp > 0) {
				const now = new Date()
				const farmFinishAt = new Date(response.data.data.next_claim_timestamp)
				if (now >= farmFinishAt){
					await claimReward(stt, axios, token, id)
					await startFarm(stt, axios, token, id)
				} else console.log(green.bold(`[Nauquu.Digiverse] Account ${stt} | Can claim at ${formatTimeToUTC7(farmFinishAt)}`));
			} else await startFarm(stt, axios, token, id)
		}
	}catch(e){
		console.log(`[*] Account ${stt} | getReward err: ${e}`);
	}
}
async function startFarm(stt, axios, token, id) {
	try{ 
        const headers = {
			authorization: token
		};
		const payload = {
			uid: id
		}
		const response = await axios.post(`https://tgapp-api.digibuy.io/api/tgapp/v1/point/reward/farming`, payload, {headers});
		if (response && response.status == 200) {
			console.log(green.bold(`[Nauquu.Digiverse] Account ${stt} | Start farming`));
		}
	}catch(e){
		console.log(`[*] Account ${stt} | startFarm err: ${e}`);
	}
}
async function claimReward(stt, axios, token, id) {
	try{ 
        const headers = {
			authorization: token
		};
		const payload = {
			uid: id
		}
		const response = await axios.post(``, payload, {headers});
		if (response && response.status == 200) {
			console.log(green.bold(`[Nauquu.Digiverse] Account ${stt} | Start farming`));
		}
	}catch(e){
		console.log(`[*] Account ${stt} | claimReward err: ${e}`);
	}
}
async function getUserData(stt, axios, token, id)
{
	try{ 
        const headers = {
			authorization: token
		};
		const payload = {
			uid: id
		}
		const response = await axios.post(`https://tgapp-api.digibuy.io/api/tgapp/v1/user/profile`, payload, {headers});
		if (response && response.status == 200) {
			return response.data.data;
		}
	}catch(e){
		console.log(`[*] Account ${stt} | getUserData err: ${e}`);
		
	}
}
async function getTask(stt, axios, token, id)
{
	try{ 
        const headers = {
			authorization: token
		};
		const payload = {
			uid: id
		}
		const response = await axios.post(`https://tgapp-api.digibuy.io/api/tgapp/v1/tasks/list`, payload, {headers});
		if (response && response.status == 200) {
			const taskList = response.data.data
			for (const category of taskList) {
				if (category) {
					for (const task of category) {
						if (!task.complete) await startTask(stt, axios, token, id)
					}
				}
			}
		}
	}catch(e){
		console.log(`[*] Account ${stt} | getTask err: ${e}`);
		
	}
}

//
async function main(stt, account, axios) {
	try {
		// let urlData = querystring.unescape(account).split('tgWebAppData=')[1].split('&tgWebAppVersion')[0];
		const fragment = new url.URL(account).hash.substring(1);
		const params = querystring.parse(fragment);
		const tgWebAppData = querystring.parse(params.tgWebAppData);
		const user = JSON.parse(decodeURIComponent(tgWebAppData.user));
		
		const uInfo = {
			uid: user.id,
			first_name: user.first_name,
			last_name: user.last_name,
			username: user.username,
			tg_login_params: params.tgWebAppData
		};
		console.log(cyan.bold(`[#] Account ${stt} | Login...`));
		await sleep(5);
		const token = await login(stt, uInfo, axios)
		if (token) {
			const uData = await getUserData(stt, urlData, axios)

		}
		console.log(token);
		
		// const balance = await getBalance(stt, urlData, axios)
		// if (uData) {
		// 	console.log(green.bold(`[#] Account ${stt} | User: ${uData.username}, Balance: ${balance}, Tap: ${uData.clickNumberLeft}`));
		// 	if (uData.clickNumberLeft) {
		// 		await tap(stt, urlData, axios, uData.clickNumberLeft)
		// 	}
		// 	if (uData.isClaimableFarming) {
		// 		await claimFarm(stt, urlData, axios)
		// 		await startFarm(stt, urlData, axios)
		// 	} else {
		// 		const farmEndAt = new Date(uData.lastFarmingTime + 4*3600*1000)
		// 		console.log(green.bold(`[#] Account ${stt} | Farm end at ${formatTimeToUTC7(farmEndAt)}`));
		// 	}
		// }
		// console.log(cyan.bold(`[#] Account ${stt} | Done!`));

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
			console.log(gray.bold(`[#] Account ${stt} | IP: ${checkIp}`));
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
