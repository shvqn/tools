import querystring from 'querystring';
import { countdown, randomInt, getConfig, contentId, sleep, getData } from './utils.js';
import { cyan, yellow, blue, green, magenta } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";

//config
const accounts = [
	'https://www.yescoin.gold/#tgWebAppData=user%3D%257B%2522id%2522%253A5904599269%252C%2522first_name%2522%253A%2522Qu%25C3%25A2n%2522%252C%2522last_name%2522%253A%2522%2522%252C%2522username%2522%253A%2522Shvqn%2522%252C%2522language_code%2522%253A%2522vi%2522%252C%2522allows_write_to_pm%2522%253Atrue%257D%26chat_instance%3D1124834316034502227%26chat_type%3Dsender%26auth_date%3D1718895638%26hash%3D933bdb6b288346ab22acb013feb062e66938270e7959be178908c30aa2977242&tgWebAppVersion=7.4&tgWebAppPlatform=android&tgWebAppThemeParams=%7B%22bg_color%22%3A%22%23212121%22%2C%22button_color%22%3A%22%238774e1%22%2C%22button_text_color%22%3A%22%23ffffff%22%2C%22hint_color%22%3A%22%23aaaaaa%22%2C%22link_color%22%3A%22%238774e1%22%2C%22secondary_bg_color%22%3A%22%23181818%22%2C%22text_color%22%3A%22%23ffffff%22%2C%22header_bg_color%22%3A%22%23212121%22%2C%22accent_text_color%22%3A%22%238774e1%22%2C%22section_bg_color%22%3A%22%23212121%22%2C%22section_header_text_color%22%3A%22%238774e1%22%2C%22subtitle_text_color%22%3A%22%23aaaaaa%22%2C%22destructive_text_color%22%3A%22%23ff595a%22%7D',
];
const proxies = ['203.175.96.54:23270:Proxy910:Proxy910'];

let timeRerun = 1; //phút time nghỉ mỗi lượt chạy
let numberThread = 1; // số luồng chạy /1 lần 


function createAxiosInstance(proxy) {
	return new AxiosHelpers({
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Accept-Language":
        "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
      Origin: "https://www.yescoin.gold",
      Referer: "https://www.yescoin.gold/",
      "Sec-Ch-Ua":
        '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"Windows"',
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-site",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    },
    proxy: proxy ? proxy : false,
  });
}

async function login(stt, code, axios){
	try{
		const headers = {};

		const payload = {"code" : `${decodeURIComponent(code)}`};

		const response = await axios.post('https://api.yescoin.gold/user/login', payload, { headers: headers });

		if(response && response.data.code == 0){
				console.log(blue.bold(`[*] Account ${stt}: Get token success`));
				return response.data.data.token;
		}

	}catch(e){
		console.log(`login err: ${e}`);
	}
}


async function getAccountInfo(stt, token, axios) {
	try {
			const headers = {
				'Token': token,
			};

			const getAccountResponse = await axios.get('https://api.yescoin.gold/account/getAccountInfo', { headers });
			
			if (getAccountResponse.status === 200) {
				const {currentAmount, rank, userLevel, inviteAmount} = getAccountResponse.data.data;
					console.log(magenta(`[+] Account ${stt}: Amount: ${currentAmount}, Rank: ${rank}, Level: ${userLevel}, Invite amount: ${inviteAmount}`));
					return getAccountResponse.data.data;
			} else {
					console.error('[+] Account ${stt}: Error ', getAccountResponse.status);
					return null;
			}
	} catch (error) {
			console.error('get account info err:', error);
	}
}


async function main(stt, account, axios)
{
    try{
        let urlData = querystring.unescape(account).split('tgWebAppData=')[1].split('&tgWebAppVersion')[0];
        
        let access_token = await login(stt, urlData, axios);
        if(access_token){
            await getAccountInfo(stt, access_token, axios);
			console.log(cyan.bold(`[#] Account ${stt} | Done!`));
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
    const accountChunks = createChunks(accounts, numberThread);

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
					const maskedProxy = proxy.slice(0, -10) + '**********';
					console.log(`[#] Account ${stt} | Proxy: ${maskedProxy}`);
					console.log(`[#] Account ${stt} | Check IP...`);
					let checkIp = await checkIP(axiosInstance);
					console.log(`[#] Account ${stt} | Run at IP: ${checkIp}`);
					await main(stt, account,axiosInstance);
			}
		});

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
			await countdown(timeRerun* 60);
	}
}
mainLoopMutil();

function formatTime(time) {
    return time < 10 ? `0${time}` : time;
}

function updateClock() {
    const now = new Date();
    const hours = formatTime(now.getHours());
    const minutes = formatTime(now.getMinutes());
    const seconds = formatTime(now.getSeconds());

    const clockDisplay = `${hours}:${minutes}:${seconds}`;
    process.stdout.write('\r' + ' '.repeat(process.stdout.columns) + '\r');
    
    process.stdout.write(clockDisplay);
}

setInterval(updateClock, 30000);

updateClock();