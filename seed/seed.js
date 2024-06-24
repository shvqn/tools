import { countdown, sleep, getData, formatNumberFloatFix, formatDecimals } from './utils.js';
import { cyan, yellow, blue, green, red } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";
import moment from 'moment-timezone';
import querystring from 'querystring';

const accounts = getData("data_seed.txt");
const proxies = getData("proxy.txt");

let timeRerun = 60; //phút time nghỉ mỗi lượt chạy
let numberThread = 10; // số luồng chạy /1 lần 

let auto_daily_bonus = true;

function createAxiosInstance(proxy, headers = null) {
    const defaultHeaders = {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
        'cache-control': 'no-cache',
        'origin': 'https://seeddao.org',
        'pragma': 'no-cache',
        'priority': 'u=1, i',
        'referer': 'https://seeddao.org/',
        'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Linux"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
    };
    
    const mergedHeaders = headers ? { ...defaultHeaders, ...headers } : defaultHeaders;

    return new AxiosHelpers({
        headers: mergedHeaders,
        proxy: proxy ? proxy : false,
    });
}
//end config

// main
function getMineTime(storageLevel) {
    const x = parseInt(storageLevel);
    const timeMapping = {
        0: 2,
        1: 3,
        2: 4,
        3: 6,
        4: 12,
        5: 24
    };
    return timeMapping[x];
}

async function getNextWaitingTime(lastClaim, storageLevel) {
    const miningTime = getMineTime(storageLevel);
    const lastClaimedDt = moment.tz(lastClaim, 'UTC');
    const nextClaimedDt = lastClaimedDt.clone().add(miningTime, 'hours');
    const currentTime = moment.tz('UTC');
    const waitingTimeSeconds = nextClaimedDt.diff(currentTime, 'seconds');
    return Math.max(0, waitingTimeSeconds);
}

function showWaitTime(stt, waitTime) {
    const hours = Math.floor(waitTime / 3600);
    const minutes = Math.floor((waitTime % 3600) / 60);
    const seconds = waitTime % 60; 

    function padTime(value) {
        return value < 10 ? `0${value}` : value;
    }

    const paddedHours = padTime(hours);
    const paddedMinutes = padTime(minutes);
    const paddedSeconds = padTime(seconds);

    console.log(yellow.bold(`[+] Account ${stt} | Next Claim later: ${paddedHours}:${paddedMinutes}:${paddedSeconds}!`));
}

async function getBalance(stt, axios){
    try { 
        const headers = { };
        const response = await axios.get(`https://elb.seeddao.org/api/v1/profile/balance`, { headers: headers });
        if(response && response.status == 200){
            return formatNumberFloatFix(formatDecimals(response.data.data));
        }              
    }catch(e) {
        console.log(`getBalance err: ${e}`);
    }

}
async function getProfile(stt, axios) {
    const headers = {};

    try {
        let stt = 3;
        let run = 0;
        while(true){
            const response = await axios.get(`https://elb.seeddao.org/api/v1/profile`, { headers: headers });
            if(response && response.status == 200){
                const data = response.data;
                return data;
            } 
            run++;

            if(run>=3){
                break;
            }
        }
    } catch (e) {
        if(e && e.response.status == '401'){
            console.log(red.bold(`[+] Account ${stt} | Lỗi đăng nhập hoặc Account Hết hạn vui lòng lấy lại link iframe!`));
        }else{
            console.log(`getProfile err: ${e}`);
        }
    }
}

async function getClaim(stt, axios) {
    const url = 'https://elb.seeddao.org/api/v1/seed/claim';

    try {
        const headers = {};

        const response = await axios.post(url, null, { headers: headers });
        const data = response.data;
        const amount = formatNumberFloatFix(formatDecimals(data.data.amount));

        if (amount > 0) {
            console.log(green.bold(`[+] Account ${stt} | Claimed: ${amount}`)); 
        }

    } catch (e) {
        console.error(e);
    }
}
async function loginBonus(stt, axios, part = 1) {
    const url = 'https://elb.seeddao.org/api/v1/login-bonuses';

    try {
        const headers = {};
        if(part == 1){
            const response = await axios.post(url, null, { headers: headers });
            if(response && response.status == 200){
                const data = response.data;
                console.log(green.bold(`[+] Account ${stt} | Login bonus amount+: ${formatNumberFloatFix(formatDecimals(data.data.amount))}`));
            }

        }else{
            const response = await axios.get(url, { headers: headers });
            const data = response.data;
        }

    } catch (e) {
        if(e && e.response.status == 400){
            console.log(blue.bold(`[+] Account ${stt} | Already claimed bonus for today!`));
        }else{
            console.log(`loginBonus err: ${e}`);
        }
    }
}
//
async function main(stt, account, axios)
{
    try{
        let queryId = querystring.unescape(account).split('tgWebAppData=')[1].split('&tgWebAppVersion')[0];
        
        let profile = await getProfile(stt, axios);
        if(profile){
            let balance = await getBalance(stt, axios);

            let name = profile.data.name;
            let last_claim = profile.data.last_claim;

            console.log(cyan.bold(`[*] Account ${stt} | Name: ${name}, Balance: ${balance}, Last Claim: ${last_claim}`));

            const upgrades = profile.data?.upgrades || [];
            const highestStorageLevel = upgrades
                .filter(upgrade => upgrade.upgrade_type === 'storage-size')
                .reduce((max, upgrade) => Math.max(max, upgrade.upgrade_level), 0);

            let waitTime = await getNextWaitingTime(profile.data.last_claim, highestStorageLevel);

            if (waitTime > 0) {
                showWaitTime(stt, waitTime);
            }else{
                // claim
                await getClaim(stt, axios);
            }

            //login bonus daily
            if(auto_daily_bonus){
                await loginBonus(stt, axios, 1);
            }
			console.log(cyan.bold(`[#] Account ${stt} | Done!`));
            await sleep(2);
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
        if(countPrx >=30){
            numberThread = 30;
        }else if(countPrx > 0){
            numberThread = countPrx
        }
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
                    let queryId = querystring.unescape(account).split('tgWebAppData=')[1].split('&tgWebAppVersion')[0];
                    const headers = {
                        "Telegram-Data" : queryId
                    }
					let axiosInstance = createAxiosInstance(proxy, headers);
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
			await countdown(timeRerun*60);
	}
}
mainLoopMutil();
