import querystring from 'querystring';
import { countdown, randomInt, sleep, getData } from './utils.js';
import { cyan, yellow, blue, green } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";
// import moment from 'moment-timezone';

let timeRerun = 5; //phút time nghỉ mỗi lượt chạy

const priceToBuy = "0.0000108" //usdt
const priceToSell = "0.000015"
const coin = "pepe"
const minToSell = "100000" //pepe
let totalEarn = 2.08

function createAxiosInstance() {
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
	});
}
//end config
// main
async function getToken(axios, query)
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
		console.log(`[*] getToken err: ${e}`);
	}
}
async function getAssets(axios, token)
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
		console.log(`[*] getAssets err: ${e}`);
	}
}
async function buy(axios, token, amount)
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
			console.log(cyan.bold(`[Nauquu] Buy ${amount} ${coin} Price: ${priceToBuy}usdt`));
			console.log(cyan.bold(`[Nauquu] Waiting for the seller`));
        } else console.log(blue.bold(`[Nauquu] ${response.data.message}`));
	}catch(e){
		console.log(`[*] buy err: ${e}`);
	}
}
async function sell(axios, token, amount, id, price)
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
			console.log(cyan.bold(`[Nauquu] Sell ${amount} Price: ${price} usdt`));
			console.log(green.bold(`[Nauquu] Earned ${amount*(price-priceToBuy)} usdt`));
			totalEarn = totalEarn + amount*(price-priceToBuy)
			return true
        } else {
			console.log(blue.bold(`[Nauquu] ${response.data.message}`));
			return false
		}
	}catch(e){
		console.log(`[*] buy err: ${e}`);
		return false
	}
}
async function getListPrice(axios, token, startId)
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
		console.log(`[*] buy err: ${e}`);
	}
}
//
async function main() {
	try {
		const account = "https://swap.rovex.io/#tgWebAppData=query_id%3DAAHlCPFfAgAAAOUI8V-9Jsdt%26user%3D%257B%2522id%2522%253A5904599269%252C%2522first_name%2522%253A%2522Nauquu%2522%252C%2522last_name%2522%253A%2522%2522%252C%2522username%2522%253A%2522Nauquu%2522%252C%2522language_code%2522%253A%2522en%2522%252C%2522allows_write_to_pm%2522%253Atrue%257D%26auth_date%3D1721958865%26hash%3Da61343d0865d21a74d7316987b4233214b919d97c372c73fc434904e602050bb&tgWebAppVersion=7.6&tgWebAppPlatform=weba&tgWebAppThemeParams=%7B%22bg_color%22%3A%22%23212121%22%2C%22text_color%22%3A%22%23ffffff%22%2C%22hint_color%22%3A%22%23aaaaaa%22%2C%22link_color%22%3A%22%238774e1%22%2C%22button_color%22%3A%22%238774e1%22%2C%22button_text_color%22%3A%22%23ffffff%22%2C%22secondary_bg_color%22%3A%22%230f0f0f%22%2C%22header_bg_color%22%3A%22%23212121%22%2C%22accent_text_color%22%3A%22%238774e1%22%2C%22section_bg_color%22%3A%22%23212121%22%2C%22section_header_text_color%22%3A%22%23aaaaaa%22%2C%22subtitle_text_color%22%3A%22%23aaaaaa%22%2C%22destructive_text_color%22%3A%22%23e53935%22%7D"
		const axios = createAxiosInstance()
		let urlData = querystring.unescape(account).split('tgWebAppData=')[1].split('&tgWebAppVersion')[0];
		console.log(cyan.bold(`[Nauquu] Login...`));
		await sleep(5);
		let token = await getToken(axios, urlData);
		if(token){
			const balance = await getAssets(axios, token)
			let amounts = balance.map(item => {
				if (item.amount != 0){
					return `${item.amount} ${item.a_type},`
				}
			}).join(' ');
			console.log(green.bold(`[Nauquu] Balance: ${amounts}`));
			let start_id = ""
			let amount
			let finish = false
			let coinAmount = balance.find(item => item.a_type == coin).amount
			if (coinAmount>0){
				while (true) {
					const priceList = await getListPrice(axios,token, start_id)
					if (priceList) {
						for (const price of priceList) {
							console.log(cyan.bold(`[Nauquu] Checking Price: ${price.price}, Amount: ${price.amount_cur}/${price.amount_max}`));
							if (price.amount_max - price.amount_cur >= minToSell && price.price >= priceToSell){
								amount = (price.amount_max - price.amount_cur > coinAmount) ? coinAmount : price.amount_max - price.amount_cur;
								const sellSuccess = await sell(axios, token, amount , price.id, price.price)
								if (sellSuccess) {
									if (amount!=coinAmount) {
										coinAmount =- price.amount_max - price.amount_cur
									} else {
										finish = true
										break;
									}
								}
							} else if (price.price < priceToSell) {
								finish = true
								break;
							}
						}
					} else break
					if (finish) break;
					start_id = priceList[priceList.length-1].id
				}
			} else console.log(yellow.bold(`[Nauquu] Out of ${coin}`));
			if (Math.floor(balance.find(item => item.a_type == "usdt").amount / priceToBuy) > minToSell) {
				await buy(axios, token, Math.floor(balance.find(item => item.a_type == "usdt").amount / priceToBuy))
			}
		}
		console.log(yellow.bold(`[Nauquu] Total Earned ${totalEarn} usdt`));
		console.log(cyan.bold(`[Nauquu] Done!`));

	} catch (e) {
		console.log(`Main Err: ${e}`);
	}
}
// end main

// default
async function mainLoop() {
	while (true) {
		await main();
		await countdown(timeRerun * 60);
	}
}
mainLoop()