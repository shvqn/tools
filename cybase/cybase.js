import querystring from 'querystring';
import { countdown, randomInt, sleep, getData, getUserDataFromUrl, cPrx, formatNum } from './utils.js';
import { cyan, yellow, blue, green } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";
import readline from 'readline';

const accounts = getData("data_cybase.txt");
const proxies = getData("proxy.txt");

let timeRerun = 8*60; //phút time nghỉ mỗi lượt chạy
let numberThread = 1; // số luồng chạy /1 lần 
//

function createAxiosInstance(proxy) {
	return new AxiosHelpers({
    headers: {
			'accept': 'application/json, text/plain, */*',
			'accept-language': 'vi;q=0.7',
			'origin': 'https://front.cybase.io',
			'priority': 'u=1, i',
			'referer': 'https://front.cybase.io/',
			'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Microsoft Edge";v="126"',
			'sec-ch-ua-mobile': '?1',
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
function formatTimeToUTC7(date) {
    const utcOffset = 0; // UTC+7
    const utc7Date = new Date(date.getTime() + utcOffset * 60 * 60 * 1000);

    const hours = String(utc7Date.getUTCHours()).padStart(2, '0');
    const minutes = String(utc7Date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(utc7Date.getUTCSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}
// main
async function getUserData(stt, uid, axios) {
	try {
		const response = await axios.get(`https://back.cybase.io/api/v1/widget/users/telegram/${uid}`);
		if (response && response.status == 200) {
			return response.data;
		}
	} catch (e) {
		console.log(`[*] Account ${stt} | getUserData: ${e}`);
	}
}
async function getFarm(stt, uid, urlData, axios) {
	try {
		const headers = {
			"X-Api-Key": urlData
		}
		const response = await axios.get(`https://back.cybase.io/api/v1/widget/users/${uid}/latest_job`, {headers});
		if (response && response.status == 200) {
			if (response.data.status == "READY") {
				await claimFarm(stt, uid, response.data.id, axios, urlData)
				await startFarm(stt, uid, axios, urlData)
			} else if (response.data.status == "PROCESSING") {
				const farmStartAt = new Date(response.data.end_period)
				const farmFinishAt = new Date(farmStartAt.getTime() + 8*3600*1000)
				console.log(blue.bold(`[#] Account ${stt} | Farm end at ${formatTimeToUTC7(farmFinishAt)}`));
			}
		}
	} catch (e) {
		console.log(`[*] Account ${stt} | getFarm: ${e}`);
	}
}
async function claimFarm(stt, uid, farmId, axios, urlData) {
	try {
		const headers = {
			"X-Api-Key": urlData
		}
		const response = await axios.post(`https://back.cybase.io/api/v1/widget/users/${uid}/jobs/${farmId}/complete`);
		if (response && response.status == 200) {
			console.log(blue.bold(`[#] Account ${stt} | Claim farm success Balance =+ ${response.data.amount}`));
		}
	} catch (e) {
		console.log(`[*] Account ${stt} | claimFarm: ${e}`);
	}
}
async function startFarm(stt, uid, axios, urlData) {
	try {
		const headers = {
			"X-Api-Key": urlData
		}
		const response = await axios.post(`https://back.cybase.io/api/v1/widget/users/${uid}/jobs`);
		if (response && response.status == 200) {
			console.log(blue.bold(`[#] Account ${stt} | Start farm success`));
		}
	} catch (e) {
		console.log(`[*] Account ${stt} | startFarm: ${e}`);
	}
}
async function getUpgrade(stt, urlData, axios, balance) {
	try {
		const headers = {
			"Init-Data": urlData
		}
		const payload = {}
		const response = await axios.post(`https://api.earthcoin.club/api/detect/upgrade/conf`, { headers });
		if (response && response.status == 200) {
			const currentDetectorLevel = response.data.data.userDetector.detLevel
			const currentSpeedLevel = response.data.data.userDetector.speedLevel
			const currentStationLevel = response.data.data.userDetector.cycleLevel
			console.log(yellow.bold(`[#] Account ${stt} | Detector: LV${currentDetectorLevel}, Speed: LV${currentSpeedLevel}, Station: LV${currentStationLevel
			}`));
			const nextDetectorPrice = response.data.data.detector[currentDetectorLevel].upgradeCost
			const nextSpeedPrice = response.data.data.speed[currentSpeedLevel].upgradeCost
			const nextStationPrice = response.data.data.station[currentStationLevel].upgradeCost
			const detectorUrl = ""
			const speedUrl = ""
			const stationUrl = ""
			if (balance > nextDetectorPrice) {
				await upgrade(stt, urlData, axios, detectorUrl)
				if (response && response.status == 200) {
					console.log(green.bold(`[#] Account ${stt} | Upgrade detector LV${nextDetectorPrice}`));
				}
			}
			if (balance > nextSpeedPrice) {
				await upgrade(stt, urlData, axios, speedUrl)
				if (response && response.status == 200) {
					console.log(green.bold(`[#] Account ${stt} | Upgrade speed LV${nextSpeedPrice}`));
				}
			}
			if (balance > nextStationPrice) {
				await upgrade(stt, urlData, axios, stationUrl)
				if (response && response.status == 200) {
					console.log(green.bold(`[#] Account ${stt} | Upgrade station LV${nextStationPrice}`));
				}
			}
		}
	}catch (e) {
		console.log(`[*] Account ${stt} | getUpgrade error: ${e}`);
	}
}

async function upgrade(stt, urlData, axios, url) {
	try {
		const headers = {
			"Init-Data": urlData
		};
		return await axios.post(url, { headers });
	} catch (e) {
		console.log(`[*] Account ${stt} | upgrade: ${e}`);
	}
}
//
async function main(stt, account, axios)
{
    try{
		let urlData = querystring.unescape(account).split('tgWebAppData=')[1].split('&tgWebAppVersion')[0];
		let query = account.split('#')[1];
		let parsedQuery = querystring.parse(query);
		let userData = parsedQuery['tgWebAppData'];
		let uidMatch = userData.match(/%22id%22%3A(\d+)/);
		let uid = uidMatch ? uidMatch[1] : null;
		console.log(cyan.bold(`[#] Account ${stt} | Auth...`));
		await sleep(5);
        let uData = await getUserData(stt, uid, axios);
        if(uData){
			const {username, balance, id, speed_level} = uData
			console.log(blue.bold(`[*] Account ${stt} | User: ${username}, Balance: ${balance}, Speed level: ${speed_level}`));
			await getFarm(stt, id, urlData, axios)

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
