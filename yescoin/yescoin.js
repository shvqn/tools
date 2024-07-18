import querystring from 'querystring';
import { countdown, randomInt, sleep } from './utils.js';
import { cyan, yellow, blue, green, magenta } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";

//config
const accounts = [
	'https://www.yescoin.gold/#tgWebAppData=user%3D%257B%2522id%2522%253A5904599269%252C%2522first_name%2522%253A%2522Qu%25C3%25A2n%2522%252C%2522last_name%2522%253A%2522%2522%252C%2522username%2522%253A%2522Shvqn%2522%252C%2522language_code%2522%253A%2522vi%2522%252C%2522allows_write_to_pm%2522%253Atrue%257D%26chat_instance%3D1124834316034502227%26chat_type%3Dsender%26auth_date%3D1718895638%26hash%3D933bdb6b288346ab22acb013feb062e66938270e7959be178908c30aa2977242&tgWebAppVersion=7.4&tgWebAppPlatform=android&tgWebAppThemeParams=%7B%22bg_color%22%3A%22%23212121%22%2C%22button_color%22%3A%22%238774e1%22%2C%22button_text_color%22%3A%22%23ffffff%22%2C%22hint_color%22%3A%22%23aaaaaa%22%2C%22link_color%22%3A%22%238774e1%22%2C%22secondary_bg_color%22%3A%22%23181818%22%2C%22text_color%22%3A%22%23ffffff%22%2C%22header_bg_color%22%3A%22%23212121%22%2C%22accent_text_color%22%3A%22%238774e1%22%2C%22section_bg_color%22%3A%22%23212121%22%2C%22section_header_text_color%22%3A%22%238774e1%22%2C%22subtitle_text_color%22%3A%22%23aaaaaa%22%2C%22destructive_text_color%22%3A%22%23ff595a%22%7D',
	'https://www.yescoin.gold/#tgWebAppData=user%3D%257B%2522id%2522%253A7139245507%252C%2522first_name%2522%253A%2522Hehe%2522%252C%2522last_name%2522%253A%2522%2522%252C%2522language_code%2522%253A%2522en%2522%252C%2522allows_write_to_pm%2522%253Atrue%257D%26chat_instance%3D1524236561441696289%26chat_type%3Dsender%26auth_date%3D1718896455%26hash%3Dd77d4f05069724137c8e0903ff2b2e47f93c2b392cb20ddf1212e880054d114d&tgWebAppVersion=7.4&tgWebAppPlatform=web&tgWebAppThemeParams=%7B%22bg_color%22%3A%22%23212121%22%2C%22button_color%22%3A%22%238774e1%22%2C%22button_text_color%22%3A%22%23ffffff%22%2C%22hint_color%22%3A%22%23aaaaaa%22%2C%22link_color%22%3A%22%238774e1%22%2C%22secondary_bg_color%22%3A%22%23181818%22%2C%22text_color%22%3A%22%23ffffff%22%2C%22header_bg_color%22%3A%22%23212121%22%2C%22accent_text_color%22%3A%22%238774e1%22%2C%22section_bg_color%22%3A%22%23212121%22%2C%22section_header_text_color%22%3A%22%238774e1%22%2C%22subtitle_text_color%22%3A%22%23aaaaaa%22%2C%22destructive_text_color%22%3A%22%23ff595a%22%7D',
	'https://www.yescoin.gold/#tgWebAppData=user%3D%257B%2522id%2522%253A7078027252%252C%2522first_name%2522%253A%2522Peter%2522%252C%2522last_name%2522%253A%2522Lee%2522%252C%2522language_code%2522%253A%2522en%2522%252C%2522allows_write_to_pm%2522%253Atrue%257D%26chat_instance%3D-2583408524745745862%26chat_type%3Dsender%26auth_date%3D1718896601%26hash%3D2ece8e4e1458a21d658af3f2c894554c6ebd2f16ca19fd797500230da34e376c&tgWebAppVersion=7.4&tgWebAppPlatform=android&tgWebAppThemeParams=%7B%22bg_color%22%3A%22%23212121%22%2C%22text_color%22%3A%22%23ffffff%22%2C%22hint_color%22%3A%22%23aaaaaa%22%2C%22link_color%22%3A%22%238774e1%22%2C%22button_color%22%3A%22%238774e1%22%2C%22button_text_color%22%3A%22%23ffffff%22%2C%22secondary_bg_color%22%3A%22%230f0f0f%22%2C%22header_bg_color%22%3A%22%23212121%22%2C%22accent_text_color%22%3A%22%238774e1%22%2C%22section_bg_color%22%3A%22%23212121%22%2C%22section_header_text_color%22%3A%22%23aaaaaa%22%2C%22subtitle_text_color%22%3A%22%23aaaaaa%22%2C%22destructive_text_color%22%3A%22%23e53935%22%7D',
	'https://www.yescoin.gold/#tgWebAppData=user%3D%257B%2522id%2522%253A6547839986%252C%2522first_name%2522%253A%2522Quan%2522%252C%2522last_name%2522%253A%2522Hoang%2522%252C%2522language_code%2522%253A%2522en%2522%252C%2522allows_write_to_pm%2522%253Atrue%257D%26chat_instance%3D2038667892024888623%26chat_type%3Dsender%26auth_date%3D1718896762%26hash%3Df7a4b0ccf05c8527d4f588f0336b189596d59574b6fbedb9c2a04bb21595c6ea&tgWebAppVersion=7.4&tgWebAppPlatform=weba&tgWebAppThemeParams=%7B%22bg_color%22%3A%22%23212121%22%2C%22text_color%22%3A%22%23ffffff%22%2C%22hint_color%22%3A%22%23aaaaaa%22%2C%22link_color%22%3A%22%238774e1%22%2C%22button_color%22%3A%22%238774e1%22%2C%22button_text_color%22%3A%22%23ffffff%22%2C%22secondary_bg_color%22%3A%22%230f0f0f%22%2C%22header_bg_color%22%3A%22%23212121%22%2C%22accent_text_color%22%3A%22%238774e1%22%2C%22section_bg_color%22%3A%22%23212121%22%2C%22section_header_text_color%22%3A%22%23aaaaaa%22%2C%22subtitle_text_color%22%3A%22%23aaaaaa%22%2C%22destructive_text_color%22%3A%22%23e53935%22%7D'
];
const proxies = ['103.173.228.184:15741:dfas96itr:asdif0ort'];

let timeRerun = 20; //phút time nghỉ mỗi lượt chạy
let numberThread = 1; // số luồng chạy /1 lần 

let apply_daily_energy = true; // full recovery in game
let apply_daily_turbo = true; // chest in game
let claimOriginal = true; // claim original 

let autoUpgrade = true
//config upgrade
let upgrade_tap = true;
let max_tap_level = 12; // nâng tối đa cấp bao nhiêu

let upgrade_energy = true;
let max_energy_level = 12; // nâng tối đa cấp bao nhiêu

let upgrade_charge = true;
let max_charge_level = 12; // nâng tối đa cấp bao nhiêu
// 

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
//end config

// main

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
async function getAccountBuildInfo(stt, token, axios) {
	try {
			const headers = {
				'Token': token,
			};
			const getAccountBuildResponse = await axios.get('https://api.yescoin.gold/build/getAccountBuildInfo', { headers });
			if (getAccountBuildResponse.status === 200) {
                return getAccountBuildResponse.data.data;
			} else {
					console.error(`[+] Account ${stt}: Error `, getAccountBuildResponse.status);
					return null;
			}
	} catch (error) {
			console.error('get account build err:', error);
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
					console.log(magenta(`[+] Account ${stt}: Amount: ${currentAmount}, Rank: ${rank}`));
					return getAccountResponse.data.data;
			} else {
					console.error('[+] Account ${stt}: Error ', getAccountResponse.status);
					return null;
			}
	} catch (error) {
			console.error('get account info err:', error);
	}
}

async function getGameInfo(token, axios) {
	try {
			const headers = {
				'Token': token,
			};

			const gameInfoResponse = await axios.get('https://api.yescoin.gold/game/getGameInfo', { headers });
			if (gameInfoResponse.status === 200) {
					// const { coinPoolTotalCount, coinPoolLeftCount } = gameInfoResponse.data.data;
					// console.log(`[+] Account ${stt}: Energy ${coinPoolLeftCount}/${coinPoolTotalCount}`);
					return gameInfoResponse.data.data;
			} else {
					console.error('[+] Account ${stt}: Error', gameInfoResponse.status);
					return null;
			}
	} catch (error) {
			console.error('Lỗi rồi:', error);
	}
}

async function getSpecialBoxInfo(token, axios){
	try{
		const headers = {
			'Token': token,
		};

		const response = await axios.get('https://api.yescoin.gold/game/getSpecialBoxInfo', { headers });
		if (response.status === 200) {
			return response.data.data;
		} else {
			console.error('[+] Account ${stt}: Error', gameInfoResponse.status);
			return null;
		}
	}catch(e){
		console.log(`sendTapsWithTurbo err: ${e}`);
	}
}

async function sendTapsWithTurbo(stt, token, axios){
	try{
		const headers = {
			'Token': token,
		};

		let special_box_info = await getSpecialBoxInfo(token, axios);

		let box_type = special_box_info.recoveryBox.boxType;
		let taps = special_box_info.recoveryBox.specialBoxTotalCount;

		const payload = {'boxType': box_type, 'coinCount': taps};

		const response = await axios.post('https://api.yescoin.gold/game/collectSpecialBoxCoin', payload, { headers });
		if(response && response.status === 200){
			console.log(green.bold(`[+] Account ${stt} | Taps Turbo +: ${taps}`));
			return response.data.data.collectStatus;
		}
		return null;
	}catch(e){
		console.log(`sendTapsWithTurbo err: ${e}`);
	}
}

async function claim(stt, token, axios){
	try{
		console.log(yellow(`[+] Account ${stt}: Start Claim!!`));
		
		while (true) {
			const gameInfo = await getGameInfo(token, axios);
		
            let availableEnergy = gameInfo.coinPoolLeftCount;
            let coinsPerTap = gameInfo.singleCoinValue;
			let totalEnergy = gameInfo.coinPoolTotalCount;
			
			if (availableEnergy < 100) {
					console.log(yellow(`[+] Account ${stt}: Energy less 100 - Sleep..`));
					break;
			}
			let taps = randomInt(50,100);
			
            if (taps * coinsPerTap >= availableEnergy) {
				taps = Math.floor(availableEnergy / 10) - 1;
            }
            
			await submitPoint(stt, token, axios, taps, availableEnergy, totalEnergy)
		}

	}catch(e){
		console.log(`claim err: ${e}`);
	}
}

async function submitPoint(stt, token, axios, number, energy, totalEnergy){
	try{
		const headers = {
			'Token': token,
		};

		const payload = JSON.stringify(number);

		const postResponse = await axios.post('https://api.yescoin.gold/game/collectCoin', payload, { headers });
		
		if (postResponse.status === 200) {
				const getResponse = await axios.get('https://api.yescoin.gold/account/getAccountInfo', { headers });
				if (getResponse.status === 200) {
						const { currentAmount } = getResponse.data.data;
						console.log(green.bold(`[+] Account ${stt}: Energy: ${energy}/${totalEnergy} , Balance: ${currentAmount}`));
				} else {
						console.error(`[+] Account ${stt}: Lỗi ${getResponse.status}`);
				}
		} else {
				console.error(`[+] Account ${stt}: Lỗi ${postResponse.status}`);
		}
	}catch(e){
		console.log(`submit err: ${e}`);
	}
}

async function applyEnergyBoost(stt, token, axios){
	try {
		const headers = {
            "Token": token
		}

		const response = await axios.post('https://api.yescoin.gold/game/recoverCoinPool', null, { headers });
		if(response && response.status === 200){
			console.log(green.bold(`[+] Account ${stt} | Full Recovery success`));
		}
	}catch(e){
		console.log(`active energy err: ${e}`);
	}
}

async function applyTurboBoost(stt, token, axios){
	try {
		const headers = {
            "Token": token
		}

		const response = await axios.post('https://api.yescoin.gold/game/recoverSpecialBox', null, { headers });
		if(response && response.status === 200){
			console.log(green.bold(`[+] Account ${stt} | Apply Turbo Boost success`));
		}
	}catch(e){
		console.log(`active turbo err: ${e}`);
	}
}

async function levelUp(token, axios, boost_id){
	try{
		const headers = {
            "Token": token
		}

		const payload = boost_id;

		const response = await axios.post('https://api.yescoin.gold/build/levelUp', payload, { headers });

		if(response && response.status === 200){
			return response.data.data;
		}
	}catch(e){
		console.log(`levelUp err: ${e}`);
	}
}

async function autoUpgradeAll(stt, access_token, axios){
	try{
		let boosts_info = await getAccountBuildInfo(stt, access_token, axios);
		
		let next_tap_level = boosts_info.singleCoinLevel + 1;
		let next_energy_level = boosts_info.coinPoolTotalLevel + 1;
		let next_charge_level = boosts_info.coinPoolRecoveryLevel + 1;

		let next_tap_price = boosts_info.singleCoinUpgradeCost;
		let next_energy_price = boosts_info.coinPoolTotalUpgradeCost;
		let next_charge_price = boosts_info.coinPoolRecoveryUpgradeCost;

		let userInfo = await getAccountInfo(stt, access_token, axios);
		let balance = userInfo.currentAmount;

		if(upgrade_tap && balance > next_tap_price && next_tap_level <= max_tap_level){
			console.log(`[+] Account ${stt} | Sleep 5s before upgrade tap to ${next_tap_level} lvl`);
			await sleep(5);

			let uptap = await levelUp(access_token, axios, 1);
			if (uptap) {
				console.log(green.bold(`[+] Account ${stt} | Tap upgraded to ${next_tap_level} lvl`));
			}
			await sleep(1);
		}

		if(upgrade_energy && balance > next_energy_price && next_energy_level <= max_energy_level){
			console.log(`[+] Account ${stt} | Sleep 5s before upgrade energy to ${next_energy_level} lvl`);
			await sleep(5);
		  
			let upenergy = await levelUp(access_token, axios, 3);
			if (upenergy) {
				console.log(green.bold(`[+] Account ${stt} | Energy upgraded to ${next_energy_level} lvl`));
			}
			await sleep(1);
		}

		if(upgrade_charge && balance > next_charge_price && next_charge_level <= max_charge_level){
			console.log(`[+] Account ${stt} | Sleep 5s before upgrade charge to ${next_charge_level} lvl`);
			await sleep(5);
		  
			let upcharge = await levelUp(access_token, axios, 2);
			if (upcharge) {
				console.log(green.bold(`[+] Account ${stt} | Charge upgraded to ${next_charge_level} lvl`));
			}
			await sleep(1);
		}

	}catch(e){
		console.log(`autoUpgradeAll err: ${e}`);
	}
}
//
async function main(stt, account, axios)
{
    try{
        let urlData = querystring.unescape(account).split('tgWebAppData=')[1].split('&tgWebAppVersion')[0];
        
        let access_token = await login(stt, urlData, axios);
        if(access_token){
            await getAccountInfo(stt, access_token, axios);
			if(claimOriginal){
				// auto claim
				await claim(stt, access_token, axios);
			}
            
			let boosts_info = await getAccountBuildInfo(stt, access_token, axios);
			console.log(`[+] Account ${stt}: Chest: ${boosts_info.specialBoxLeftRecoveryCount}, Full Recovery: ${boosts_info.coinPoolLeftRecoveryCount}`);

            if (apply_daily_energy) {
				const gameInfo = await getGameInfo(access_token, axios);
				
				if (boosts_info.coinPoolLeftRecoveryCount > 0 && gameInfo.coinPoolLeftCount < 100) {
                    console.log(`[#] Account ${stt} | Sleep 5s before activating the daily energy boost`);
                    await sleep(5);
                    await applyEnergyBoost(stt, access_token, axios);
                    await sleep(1); 
					await claim(stt, access_token, axios);
				}
            }

			if(apply_daily_turbo){
				if (boosts_info.specialBoxLeftRecoveryCount > 0) {
					console.log(`[#] Account ${stt} | Sleep 5s before activating the daily turbo boost`);
					await sleep(5);
			  
					await applyTurboBoost(stt, access_token, axios); 
					await sleep(1);

					await sendTapsWithTurbo(stt, access_token, axios);
				  }
			}

			if(autoUpgrade){
				await autoUpgradeAll(stt, access_token, axios);
			}


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
