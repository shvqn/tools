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
async function getToken(stt, query, axios)
{
	try{
		const headers = {}
		const payload = {
			"init_data": query,
			lang: "en",
			product_id: 1,
			referrer: ""
		}
		const response = await axios.post(`https://fission-api.hivehubs.app/api/login/tg`, payload, {headers});
		if (response && response.status == 200) {
			return response.data.data.token.token;
		}
	}catch(e){
		console.log(`[Nauquu] Account ${stt} | Lỗi! Lấy lại iframe`);
	}
}
async function saveTokenToFile(filename, token) {
	try {
	  await fs.appendFile(filename, token + '\n', { encoding: 'utf8' }); // Thêm token vào cuối file với encoding UTF-8
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
			saveTokenToFile('token.txt', token); // 
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
			return `${ip} - Country: ${country}`;
	} catch (err) {
			console.log("err checkip: ", err);
			return null;
	}
}

await runMulti();
