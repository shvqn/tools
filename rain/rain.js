import querystring from 'querystring';
import { countdown, randomInt, sleep, getData, formatTimeToUTC7} from './utils.js';
import { cyan, yellow, blue, green, magenta, red, gray } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";

//config
const accounts = getData("data.txt");
const proxies = getData("proxy.txt");

let timeRerun = 6*60; //phút time nghỉ mỗi lượt chạy
let numberThread = 1; // số luồng chạy /1 lần 
// 

function createAxiosInstance(proxy, data) {
	return new AxiosHelpers({
    headers: {
      'accept': '*/*',
      'accept-language': 'vi',
      'cache-control': 'no-cache',
      'origin': '',
      'pragma': 'no-cache',
      'priority': 'u=1, i',
	  'author': 'https://t.me/nauquu',
	  authorization: data,
      'referer': 'https://beta.hamstergo.xyz/',
      'origin': 'https://beta.hamstergo.xyz',
      'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Microsoft Edge";v="126"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0'
    },
    proxy: proxy ? proxy : false,
  });
}
//end config

// main
async function getUserData(stt, axios) {
    try {
		const response = await axios.get(`https://api.hamstergo.xyz/v1/hamstergo/tap/info/`);
		if (response && response.status === 200) {
			return response.data.data;
		} else return null
	} catch (e) {
		console.log(red.bold(`[Nauquu.HamsterGo] Account ${stt} | getUserData err: ${e}`));
		console.log();
		
		return null
	}
}
async function claimTaps(stt, axios, point) {
    try {
		const headers = {}
		const payload = {
			point: point
		}
		const response = await axios.post(`https://api.hamstergo.xyz/v1/hamstergo/tap/claim/`, payload, {headers});
		if (response && response.status === 200) {
			console.log(green.bold(`[Nauquu.HamsterGo] Account ${stt} | Claimed ${point} taps, Balance: ${response.data.data.point}`));
			
		}
	} catch (e) {
		console.log(red.bold(`[Nauquu.HamsterGo] Account ${stt} | claimFarm err: ${e}`));
	}
}
//
async function main(stt, axios)
{
    try{
		console.log(blue.bold(`[Nauquu.HamsterGo] Account ${stt} | Login...`));
		const uData = await getUserData(stt, axios)
		if (uData) {
			const {point, tap_remain_times} = uData
			console.log(cyan.bold(`[Nauquu.HamsterGo] Account ${stt} | Balance: ${point}`));
			if (tap_remain_times) await claimTaps(stt, axios, tap_remain_times)
		}
    }catch(e){
        console.log(red.bold(`Main Err: ${e}`));
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
		numberThread = countPrx;
    }
    const accountChunks = createChunks(accounts, numberThread);
	
    for (const chunk of accountChunks) {
        let proxy = null;
        const tasks = chunk.map(async (account, index) => {
            const globalIndex = accounts.indexOf(account);

            if (proxies.length > 0) {
                proxy = proxies[globalIndex % proxies.length];
            }
			if (account) {
				let urlData = querystring.unescape(account).split('tgWebAppData=')[1].split('&tgWebAppVersion')[0];
				const axiosInstance = createAxiosInstance(proxy, urlData);
				let stt = Number(globalIndex) + Number(1);
				let checkIp = await checkIP(axiosInstance);
				console.log(`[Nauquu.HamsterGo] Account ${stt} | IP: ${checkIp}`);
				await main(stt, axiosInstance);
			}
		})
		console.log(gray.bold(`============Number of thread: ${tasks.length}============`));
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
			console.log(red.bold("Error IP"));
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