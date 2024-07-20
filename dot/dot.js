import querystring from 'querystring';
import { countdown, randomInt, sleep, getData, getUserDataFromUrl, cPrx, formatNum } from './utils.js';
import { cyan, yellow, blue, green } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";
import { log } from 'util';

const accounts = getData("data_dotcoin.txt");
const proxies = getData("proxy.txt");

let timeRerun = 8*60; //phút time nghỉ mỗi lượt chạy
let numberThread = 1; // số luồng chạy /1 lần 
//
let apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impqdm5tb3luY21jZXdudXlreWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg3MDE5ODIsImV4cCI6MjAyNDI3Nzk4Mn0.oZh_ECA6fA2NlwoUamf1TqF45lrMC0uIdJXvVitDbZ8';

function createAxiosInstance(proxy) {
	return new AxiosHelpers({
    headers: {
		'accept': '*/*',
        'accept-language': 'en-ID,en-US;q=0.9,en;q=0.8,id;q=0.7',
        'apikey': apiKey,
        'content-profile': 'public',
        'content-type': 'application/json',
        'dnt': '1',
        'origin': 'https://dot.dapplab.xyz',
        'priority': 'u=1, i',
        'referer': 'https://dot.dapplab.xyz/',
        'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome 125.0.0.0 Safari/537.36',
        'x-client-info': 'postgrest-js/1.9.2'
    },
    proxy: proxy ? proxy : false,
  });
}
//end config
// main
async function getToken(stt,query, axios) {
	try {
		const headers = {
			'Authorization': `Bearer ${apiKey}`,
		}
		const payload = {
			'initData': query
		}
		const response = await axios.post(`https://api.dotcoin.bot/functions/v1/getToken`, payload, {headers});
		if (response && response.status == 200) {
			return response.data.token;
		}
	} catch (e) {
		console.log(`[*] Account ${stt} | getToken: ${e}`);
	}
}
async function getUserData(stt, query, axios) {
	try {
		const headers = {
			'Authorization': `Bearer ${query}`,
		}
		const response = await axios.post(`https://api.dotcoin.bot/rest/v1/rpc/get_user_info`,{}, {headers});
		console.log(response);
		if (response && response.status == 200) {
			return response.data;
		}
	} catch (e) {
		console.log(`[*] Account ${stt} | getUserData: ${e}`);
		console.log(e.response.data);
	}
}
async function tap(stt, query, axios) {
	try {
		const headers = {
			'Authorization': `Bearer ${query}`,
			Apikey: apiKey
		}
		const payload = {
			coins: 20000,
		}
		const response = await axios.post(`https://api.dotcoin.bot/rest/v1/rpc/save_coins`,payload, {headers});
		if (response && response.status == 200) {
			console.log(cyan.bold(`[#] Account ${stt} | Tap success`));
			return true
		} else return false
	} catch (e) {
		console.log(`[*] Account ${stt} | tap: ${e}`);
		return false
	}
}
async function upgradeDailyAttempts(stt, query, axios, level) {
	try {
		const headers = {
			'Authorization': `Bearer ${query}`,
			Apikey: apiKey
		}
		const payload = {
			lvl: level
		}
		const response = await axios.post(`https://jjvnmoyncmcewnuykyid.supabase.co/rest/v1/rpc/add_attempts`,payload, {headers});
		if (response && response.status == 200) {
			console.log(cyan.bold(`[#] Account ${stt} | Upgrade DailyAttempts Lv${level}`));
			return true
		} else return false
	} catch (e) {
		console.log(`[*] Account ${stt} | upgradeDailyAttempts: ${e}`);
		return false
	}
}
async function upgradeMultitap(stt, query, axios, level) {
	try {
		const headers = {
			'Authorization': `Bearer ${query}`,
			Apikey: apiKey
		}
		const payload = {
			lvl: level
		}
		const response = await axios.post(`https://jjvnmoyncmcewnuykyid.supabase.co/rest/v1/rpc/add_attempts`,payload, {headers});
		if (response && response.status == 200) {
			console.log(cyan.bold(`[#] Account ${stt} | Upgrade Multitap Lv${level}`));
			return true
		} else return false
	} catch (e) {
		console.log(`[*] Account ${stt} | upgradeMultitap: ${e}`);
		return false
	}
}
async function upgradeDtcMining(stt, query, axios, level) {
	try {
		const headers = {
			'Authorization': `Bearer ${query}`,
			Apikey: apiKey
		}
		const payload = {
			lvl: level
		}
		const response = await axios.post(`https://jjvnmoyncmcewnuykyid.supabase.co/rest/v1/rpc/add_attempts`,payload, {headers});
		if (response && response.status == 200) {
			console.log(cyan.bold(`[#] Account ${stt} | Upgrade DailyAttempts Lv${level}`));
			return true
		} else return false
	} catch (e) {
		console.log(`[*] Account ${stt} | upgradeDtcMining: ${e}`);
		return false
	}
}
//
async function main(stt, account, axios)
{
    try{
		let urlData = querystring.unescape(account).split('tgWebAppData=')[1].split('&tgWebAppVersion')[0];
		const token = await getToken(stt, urlData, axios);
		console.log(cyan.bold(`[#] Account ${stt} | Auth...`));
		await sleep(5);
        let uData = await getUserData(stt, urlData, axios);
        if(uData){
			const {first_name, daily_attempts, dtc_level, multiple_clicks, balance} = uData
			console.log(blue.bold(`[*] Account ${stt} | User: ${first_name}, Balance: ${balance}`));
			while (daily_attempts) {
				const tapSuccess = await tap(stt, urlData, axios)
				await sleep(randomInt(1,5))
				if (tapSuccess) daily_attempts--
			}
			const dailyAttemptsNextLevel = daily_attempts - 4
			const multitapNextLevel = multiple_clicks
			const nextdailyAttemptsPrice = Math.pow(2,dailyAttemptsNextLevel)*1000
			const nextMultitapPrice = Math.pow(2,multitapNextLevel)*1000
			const nextDtcMiningPrice = Math.pow(2,dtc_level)*50*1000
			if (balance>nextDtcMiningPrice) {
				// await upgradeDtcMining(stt, urlData, axios, dtc_level+1)

			}
			if ((balance-nextdailyAttemptsPrice)>nextDtcMiningPrice) {
				const upgradeSuccess = await upgradeDailyAttempts(stt, urlData, axios, dailyAttemptsNextLevel)
				if (upgradeSuccess) balance=-nextdailyAttemptsPrice
			}
			if ((balance-nextMultitapPrice)>nextDtcMiningPrice){
				// await upgradeMultitap(stt, urlData, axios, multitapNextLevel)
			}

			console.log(blue.bold(`[*] Account ${stt} | Done!`));
		} 
    }catch(e){
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
			numberThread = countPrx
    }
    const accountChunks = createChunks(accounts, numberThread);
		// let prx = await cPrx(); if(!prx) return;
    for (const chunk of accountChunks) {
        let proxy = null;
        const tasks = chunk.map(async (account, index) => {
            const globalIndex = accounts.indexOf(account);

            if (proxies.length > 0) {
                proxy = proxies[globalIndex % proxies.length];
            }

			if (account) {
					const axiosInstance = createAxiosInstance(proxy);
					let stt = Number(globalIndex) + Number(1);
					const maskedProxy = proxy?.slice(0, -10);
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
