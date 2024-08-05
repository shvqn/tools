import querystring from 'querystring';
import {sleep, getData } from './utils.js';
import AxiosHelpers from "./helpers/axiosHelper.js";
import { promises as fs } from 'fs';

const accounts = getData("data.txt");
const proxies = getData("proxy.txt");

let numberThread = 3; // số luồng chạy /1 lần 
// 

function createAxiosInstance(proxy) {
	return new AxiosHelpers({
		headers: {
            'accept': '*/*',
            'accept-language': 'vi',
            'cache-control': 'no-cache',
            'origin': 'https://timefarm.app',
            'pragma': 'no-cache',
            'priority': 'u=1, i',
            'author': 'https://t.me/nauquu',
            'referer': 'https://timefarm.app/',
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
async function getToken(stt, query, axios)
{
	try{
		const headers = {}
		const payload = {
			initData: query,
			platform: "ios"
		}
		const response = await axios.post(`https://tg-bot-tap.laborx.io/api/v1/auth/validate-init/v2`, payload, {headers});
		if (response && response.status == 200) {
			return response.data.token;
		}
	}catch(e){
		console.log(`[Nauquu] Account ${stt} | Lỗi! Lấy lại iframe`);
        console.log(e.response.data);
        
	}
}
async function saveTokenToFile(filename, token) {
	try {
        await fs.appendFile(filename, token + '\n', { encoding: 'utf8' });
        console.log('Token has been saved successfully!');
	} catch (err) {
        console.error('Error writing token to file:', err);
	}
}
async function main(stt, account, axios) {
    try {
        let urlData = querystring.unescape(account).split('tgWebAppData=')[1].split('&tgWebAppVersion')[0];
		const token = await getToken(stt, urlData, axios)
		if (token) {
			saveTokenToFile('token.txt', token);
		}
	} catch (e) {
		console.log(`Main Err: ${e}`);
	}
}

// end main

async function runMulti() {
    await fs.writeFile('token.txt', '', { encoding: 'utf8' });
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
					let checkIp = await checkIP(axiosInstance);
					console.log(`[Nauquu] Account ${stt} | IP: ${checkIp}`);
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
			return `${ip} - ${country}`;
	} catch (err) {
			console.log('Error IP');
			return null;
	}
}

await runMulti();