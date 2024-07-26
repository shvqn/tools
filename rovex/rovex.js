import querystring from 'querystring';
import { countdown, randomInt, sleep, getData } from './utils.js';
import { cyan, yellow, blue, green } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";
// import moment from 'moment-timezone';

const accounts = getData("data_rovex.txt");
const proxies = getData("proxy.txt");

let timeRerun = 10; //phút time nghỉ mỗi lượt chạy
let numberThread = 3; // số luồng chạy /1 lần 

const priceToBuy = "0.00001"
const coin = "pepe"
const minToSell = "100000"

function createAxiosInstance(proxy) {
	return new AxiosHelpers({
		headers: {
			'accept': 'application/json, text/plain, */*',
			'accept-language': 'vi;q=0.8',
			'content-type': 'application/json',
			'origin': 'https://swap.rovex.io',
			'priority': 'u=1, i',
			'author': 'https://t.me/nauquu',
			'referer': 'https://swap.rovex.io/',
			'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Brave";v="126"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Windows"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			'sec-gpc': '1',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
		},
		proxy: proxy ? proxy : false,
	});
}
//end config
// main
async function getToken(stt, axios, query)
{
	try{
		const headers = {};

		const payload = {
            referrer: "",
            "init_data": query,
			lang:"en",
        };
		const response = await axios.post('https://taadu-api.hivehubs.app/api/login/tg', payload, {headers});
		if (response && response.status == 200) {
			return response.data.data.token.token;
		} 
	}catch(e){
		console.log(`[*] Account ${stt} | getToken err: ${e}`);
	}
}
async function getAssets(stt, axios, token)
{
	try{
		const headers = {};

		const payload = {
            token: token ,
			"is_total": true,
			lang:"en",
			size: 20,
			"start_id":""
        };

		const response = await axios.post('https://taadu-api.hivehubs.app/api/token/list/amount', payload, { headers: headers });
		if (response && response.status == 200) {
			return response.data.data.rows;
        }
	}catch(e){
		console.log(`[*] Account ${stt} | getAssets err: ${e}`);
	}
}
async function buy(stt, axios, token, amount)
{
	try{
		const headers = {};

		const payload = {
            token: token ,
			"a_type": coin,
			lang:"en",
			amount: amount,
			price: priceToBuy
        };

		const response = await axios.post('https://taadu-api.hivehubs.app/api/order/create', payload, { headers: headers });
		if (!response.data.code && response.status == 200) {
			console.log(cyan.bold(`[Nauquu] Account ${stt} | Buy ${amount} ${coin} Price: ${priceToBuy}usdt`));
			console.log(cyan.bold(`[Nauquu] Account ${stt} | Waiting for the seller`));
        } else console.log(blue.bold(`[Nauquu] Account ${stt} | ${response.data.message}`));
	}catch(e){
		console.log(`[*] Account ${stt} | buy err: ${e}`);
	}
}
async function sell(stt, axios, token, amount, id)
{
	try{
		const headers = {};

		const payload = {
            token: token ,
			lang:"en",
			amount: amount,
			"order_id": id
        };

		const response = await axios.post('https://taadu-api.hivehubs.app/api/order/take', payload, { headers: headers });
		if (!response.data.code && response.status == 200) {
			console.log(cyan.bold(`[Nauquu] Account ${stt} | Sell ${amount} Price: usdt`));
			return true
        } else {
			console.log(blue.bold(`[Nauquu] Account ${stt} | ${response.data.message}`));
			return false
		}
	}catch(e){
		console.log(`[*] Account ${stt} | buy err: ${e}`);
		return false
	}
}
async function getListPrice(stt, axios, token, startId)
{
	try{
		const headers = {};

		const payload = {
            token: token ,
			"a_type": coin,
			lang:"en",
			size: 20,
			"start_id": startId
        };

		const response = await axios.post('https://taadu-api.hivehubs.app/api/order/list', payload, { headers: headers });
		if (response.data.code==0 && response.status == 200) {
			return response.data.data
        }
	}catch(e){
		console.log(`[*] Account ${stt} | buy err: ${e}`);
	}
}
//
async function main(stt, axios, account) {
	try {
		let urlData = querystring.unescape(account).split('tgWebAppData=')[1].split('&tgWebAppVersion')[0];
		console.log(cyan.bold(`[Nauquu] Account ${stt} | Login...`));
		await sleep(5);
		let token = await getToken(stt, axios, urlData);
		if(token){
			const balance = await getAssets(stt, axios, token)
			let amounts = balance.map(item => {
				if (item.amount != 0){
					return `${item.amount} ${item.a_type},`
				}
			}).join(' ');
			console.log(green.bold(`[Nauquu] Account ${stt} | Balance: ${amounts}`));
			let start_id = ""
			let amount
			let finish = false
			let coinAmount = balance.find(item => item.a_type == coin).amount
			if (coinAmount>0){
				while (true) {
					const priceList = await getListPrice(stt, axios,token, start_id)
					if (priceList) {
						for (const price of priceList) {
							console.log(cyan.bold(`[Nauquu] Account ${stt} | Checking Price: ${price.price}, Amount: ${price.amount_cur}/${price.amount_max}`));
							if (price.amount_max - price.amount_cur >= minToSell && price.price > priceToBuy){
								amount = (price.amount_max - price.amount_cur > coinAmount) ? coinAmount : price.amount_max - price.amount_cur;
								const sellSuccess = await sell(stt, axios, token, amount , price.id)
								if (sellSuccess) {
									if (amount!=coinAmount) {
										coinAmount =- price.amount_max - price.amount_cur
									} else {
										finish = true
										break;
									}
								}
							} else if (price.price < priceToBuy) {
								finish = true
								break;
							}
						}
					} else break
					if (finish) break;
					start_id = priceList[priceList.length-1].id
				}
			} else console.log(yellow.bold(`[Nauquu] Account ${stt} | Out of ${coin}`));
			if (Math.floor(balance.find(item => item.a_type == "usdt").amount / priceToBuy) > minToSell) {
				await buy(stt, axios, token, Math.floor(balance.find(item => item.a_type == "usdt").amount / priceToBuy))
			}
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
			console.log(`[Nauquu] Account ${stt} | Run at IP: ${checkIp}`);
			await main(stt, axiosInstance, account);
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
mainLoopMutil()