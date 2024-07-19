import querystring from 'querystring';
import { countdown, randomInt, sleep } from './utils.js';
import { cyan, yellow, blue, green, magenta } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";
import readline from 'readline'

//config
const accounts = [
	'https://tgapp.matchain.io/#tgWebAppData=user%3D%257B%2522id%2522%253A5904599269%252C%2522first_name%2522%253A%2522Qu%25C3%25A2n%2522%252C%2522last_name%2522%253A%2522%2522%252C%2522username%2522%253A%2522Shvqn%2522%252C%2522language_code%2522%253A%2522vi%2522%252C%2522allows_write_to_pm%2522%253Atrue%257D%26chat_instance%3D-7347206662651251819%26chat_type%3Dsender%26auth_date%3D1719905379%26hash%3D885d84a3d9078051fed0cb4abc946990f0540ac41cf0d437be8a55b925e23d53&tgWebAppVersion=7.4&tgWebAppPlatform=web&tgWebAppThemeParams=%7B%22bg_color%22%3A%22%23212121%22%2C%22button_color%22%3A%22%238774e1%22%2C%22button_text_color%22%3A%22%23ffffff%22%2C%22hint_color%22%3A%22%23aaaaaa%22%2C%22link_color%22%3A%22%238774e1%22%2C%22secondary_bg_color%22%3A%22%23181818%22%2C%22text_color%22%3A%22%23ffffff%22%2C%22header_bg_color%22%3A%22%23212121%22%2C%22accent_text_color%22%3A%22%238774e1%22%2C%22section_bg_color%22%3A%22%23212121%22%2C%22section_header_text_color%22%3A%22%238774e1%22%2C%22subtitle_text_color%22%3A%22%23aaaaaa%22%2C%22destructive_text_color%22%3A%22%23ff595a%22%7D',
	'https://tgapp.matchain.io/#tgWebAppData=user%3D%257B%2522id%2522%253A7139245507%252C%2522first_name%2522%253A%2522Hehe%2522%252C%2522last_name%2522%253A%2522%2522%252C%2522language_code%2522%253A%2522vi%2522%252C%2522allows_write_to_pm%2522%253Atrue%257D%26chat_instance%3D2901698951088222756%26chat_type%3Dsender%26auth_date%3D1719928144%26hash%3D314768e714f24c9a0fcf1ecde0a9699b8c47169969edb95473f06744b4c9ffd7&tgWebAppVersion=7.4&tgWebAppPlatform=web&tgWebAppThemeParams=%7B%22bg_color%22%3A%22%23212121%22%2C%22button_color%22%3A%22%238774e1%22%2C%22button_text_color%22%3A%22%23ffffff%22%2C%22hint_color%22%3A%22%23aaaaaa%22%2C%22link_color%22%3A%22%238774e1%22%2C%22secondary_bg_color%22%3A%22%23181818%22%2C%22text_color%22%3A%22%23ffffff%22%2C%22header_bg_color%22%3A%22%23212121%22%2C%22accent_text_color%22%3A%22%238774e1%22%2C%22section_bg_color%22%3A%22%23212121%22%2C%22section_header_text_color%22%3A%22%238774e1%22%2C%22subtitle_text_color%22%3A%22%23aaaaaa%22%2C%22destructive_text_color%22%3A%22%23ff595a%22%7D',
	'https://tgapp.matchain.io/?tgWebAppStartParam=1897573196ff95946e31e174ae7fe702#tgWebAppData=user%3D%257B%2522id%2522%253A7078027252%252C%2522first_name%2522%253A%2522Peter%2522%252C%2522last_name%2522%253A%2522Lee%2522%252C%2522language_code%2522%253A%2522en%2522%252C%2522allows_write_to_pm%2522%253Atrue%257D%26chat_instance%3D-5264370034553470256%26chat_type%3Dprivate%26start_param%3D1897573196ff95946e31e174ae7fe702%26auth_date%3D1719931814%26hash%3Dbd09565d1ffb96407472cb2747bec6eb5c2c41a542907a1a05f80ef842668379&tgWebAppVersion=7.4&tgWebAppPlatform=weba&tgWebAppThemeParams=%7B%22bg_color%22%3A%22%23212121%22%2C%22text_color%22%3A%22%23ffffff%22%2C%22hint_color%22%3A%22%23aaaaaa%22%2C%22link_color%22%3A%22%238774e1%22%2C%22button_color%22%3A%22%238774e1%22%2C%22button_text_color%22%3A%22%23ffffff%22%2C%22secondary_bg_color%22%3A%22%230f0f0f%22%2C%22header_bg_color%22%3A%22%23212121%22%2C%22accent_text_color%22%3A%22%238774e1%22%2C%22section_bg_color%22%3A%22%23212121%22%2C%22section_header_text_color%22%3A%22%23aaaaaa%22%2C%22subtitle_text_color%22%3A%22%23aaaaaa%22%2C%22destructive_text_color%22%3A%22%23e53935%22%7D',
	'https://tgapp.matchain.io/?tgWebAppStartParam=1897573196ff95946e31e174ae7fe702#tgWebAppData=user%3D%257B%2522id%2522%253A6547839986%252C%2522first_name%2522%253A%2522Quan%2522%252C%2522last_name%2522%253A%2522Hoang%2522%252C%2522language_code%2522%253A%2522en%2522%252C%2522allows_write_to_pm%2522%253Atrue%257D%26chat_instance%3D2450768826572700959%26chat_type%3Dprivate%26start_param%3D1897573196ff95946e31e174ae7fe702%26auth_date%3D1719931889%26hash%3D8018b75b989830819f134afb070aaa991de219895d572f31e86d1edbc8d26980&tgWebAppVersion=7.4&tgWebAppPlatform=weba&tgWebAppThemeParams=%7B%22bg_color%22%3A%22%23212121%22%2C%22text_color%22%3A%22%23ffffff%22%2C%22hint_color%22%3A%22%23aaaaaa%22%2C%22link_color%22%3A%22%238774e1%22%2C%22button_color%22%3A%22%238774e1%22%2C%22button_text_color%22%3A%22%23ffffff%22%2C%22secondary_bg_color%22%3A%22%230f0f0f%22%2C%22header_bg_color%22%3A%22%23212121%22%2C%22accent_text_color%22%3A%22%238774e1%22%2C%22section_bg_color%22%3A%22%23212121%22%2C%22section_header_text_color%22%3A%22%23aaaaaa%22%2C%22subtitle_text_color%22%3A%22%23aaaaaa%22%2C%22destructive_text_color%22%3A%22%23e53935%22%7D'
];
const proxies = ['103.173.228.184:15741:dfas96itr:asdif0ort'];

let timeRerun = 8*60; //phút time nghỉ mỗi lượt chạy
let numberThread = 1; // số luồng chạy /1 lần 

function formatTimeToUTC7(date) {
    const utcOffset = 7; // UTC+7
    const utc7Date = new Date(date.getTime() + utcOffset * 60 * 60 * 1000);

    const hours = String(utc7Date.getUTCHours()).padStart(2, '0');
    const minutes = String(utc7Date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(utc7Date.getUTCSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

function createAxiosInstance(proxy, token) {
	return new AxiosHelpers({
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json, text/plain, */*",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Accept-Language": "vi;q=0.8",
      "Origin": "https://tgapp.matchain.io",
	  'Authorization': token,
      "Referer": "https://tgapp.matchain.io/",
      "Sec-Ch-Ua": '"Not/A)Brand";v="8", "Chromium";v="126", "Brave";v="126"',
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
async function encodeUrl(input) {
	const params = new URLSearchParams(input);
	const userEncoded = params.get('user');
	const userDecoded = decodeURIComponent(userEncoded)
	const userObject = JSON.parse(userDecoded);
	return {
		'first_name': userObject.first_name,
		'last_name': userObject.last_name,
		'tg_login_params': input,
		'uid': userObject.id,
		'username': userObject.username,
	};
}

async function login(stt, code, axios){
	try{
		const payload = await encodeUrl(code)

		const response = await axios.post('https://tgapp-api.matchain.io/api/tgapp/v1/user/login', payload);
		if(response && response.data.code == 200){
			console.log(blue.bold(`[*] Account ${stt}: Get token success`));
			return {
				token: response.data.data.token,
				uid: response.data.data.user.uid
			}
		}

	}catch(e){
		console.log(`login err: ${e}`);
	}
}
async function getQuiz(stt, token, axios) {
	try {
		const headers = {
				'Authorization': token,
			}
		const response = await axios.get('https://tgapp-api.matchain.io/api/tgapp/v1/daily/quiz/progress', {headers});
		if (response && !response.data.msg) {
			const result = []
			for (let quiz of response.data.data) {
				const correctResult = quiz.items.find(item => item.is_correct === true);
				result.push({
					id: quiz.Id,
					correct: correctResult.number
				})
			}
			if (result) {
				await claimQuiz(stt, token, axios, result)
			}
		} else console.log(cyan.bold(`[+] Account ${stt} | ${response.data.msg}`));
	} catch (e) {
		console.error(`getQuiz error: ${e}`);
	}
}
async function claimQuiz(stt, token, axios, result) {
	try {
		const headers = {
				'Authorization': token,
			}
		const payload = {
			"answer_result": []
		}
		for (let item of result) {
			payload.answer_result.push({
				"quiz_id": item.id,
				"selected_item": item.correct,
				"correct_item": item.correct
			})
		}
		const response = await axios.post('https://tgapp-api.matchain.io/api/tgapp/v1/daily/quiz/submit', payload, {headers});
		if (response && response.status == 200) {
			if (response.data.data){
				console.log(green.bold(`[#] Account ${stt} | Claim quiz success, Balance =+ ${response.data.data}`));
			} else console.log(green.bold(`[#] Account ${stt} | Claim quiz failed`));
		}
	} catch (e) {
		console.error(`claimQuiz error: ${e}`);
	}
}

async function getAccountInfo(stt, token, axios, uid) {
	try {
		const headers = {
			'Authorization': token,
		};
		const payload = {
			'uid': uid,
		}
		const getAccountResponse = await axios.post('https://tgapp-api.matchain.io/api/tgapp/v1/user/profile', payload, { headers });
		if (getAccountResponse.status === 200) {
			const {Nickname, Balance} = getAccountResponse.data.data;
				console.log(magenta(`[+] Account ${stt}: ${Nickname}, Balance: ${Balance}`));
				return getAccountResponse.data.data;
		} else {
				console.error(`[+] Account ${stt}: Error ${getAccountResponse.status}`);
				return null;
		}
	} catch (error) {
			console.error('get account info err:', error);
	}
}

async function checkClaimFarm(stt, token, axios, uid) {
	try {
		const headers = {
			'Authorization': token,
		}
		const payload = {
			'uid': uid,
		}
		const response = await axios.post('https://tgapp-api.matchain.io/api/tgapp/v1/point/reward', payload, {headers});
		if (response && response.status ==200) {
			const nextClaimAt = new Date(response.data.data.next_claim_timestamp)
			const now = new Date()
			const currentReward = response.data.data.reward
			// (nextClaimAt && nextClaimAt <= now) => claim => 1
			// (nextClaimAt && nextClaimAt > now) => next claim => 2
			// !nextClaimAt => start => 0
			if (nextClaimAt && currentReward) {
				if(nextClaimAt > now) {
					console.log(`[#] Account ${stt} | Next claim: ${formatTimeToUTC7(nextClaimAt)}`)
					return 2
				} else return 1
			} else return 0
		}
	} catch (e) {
		console.error(`checkClaimFarm error: ${e}`);
	}
}

async function claimFarm(stt,token,axios, uid) {
	try {
		const headers = {
			'Authorization': token,
		}
		const payload = {
			'uid': uid,
		}
		const response = await axios.post('https://tgapp-api.matchain.io/api/tgapp/v1/point/reward/claim', payload, {headers});
		if (response && response.status ==200) {
			console.log(`[#] Account ${stt} | Claim Farm`)
		}
	} catch (e) {
		console.error(`claimFarm error: ${e}`);
	}
}

async function startFarm(stt,token,axios, uid) {
	try {
		const headers = {
			'Authorization': token,
		}
		const payload = {
			'uid': uid,
		}
		const response = await axios.post('https://tgapp-api.matchain.io/api/tgapp/v1/point/reward/farming', payload, {headers});
		if (response && response.status ==200) {
			console.log(`[#] Account ${stt} | Start farm`)
		}
	} catch (e) {
		console.error(`startFarm error: ${e}`);	
	}
}
async function getDailyBoost(stt, token, axios) {
	try {
		const headers = {
				'Authorization': token,
			}
		const response = await axios.get('https://tgapp-api.matchain.io/api/tgapp/v1/daily/task/status', {headers});
		if (response && response.status == 200) {
			const responseData = response.data.data;
			console.log(`[#] Account ${stt} | ${responseData[0].name}: ${responseData[0].level}, ${responseData[1].name}: ${responseData[1].level}`)
			return response.data.data
		}
	} catch (e) {
		console.error(`getDailyBoost error: ${e}`);
	}
}
async function dailyBooster(stt,token,axios, uid) {
	try {
		const headers = {
			'Authorization': token,
		}
		const payload = {
			'type': "daily",
			'uid': uid,
		}
		const response = await axios.post('https://tgapp-api.matchain.io/api/tgapp/v1/daily/task/purchase', payload, {headers});
		if (response && response.status ==200) {
			console.log(`[#] Account ${stt} | ${response.data.msg}`)
		}
	} catch (e) {
		console.error(`dailyBooster error: ${e}`);	
	}
}
async function getTaskList(stt, token, axios, uid) {
	try {
		const headers = {
				'Authorization': token,
			}
		const payload = {
			'uid': uid,
		}
		const response = await axios.post('https://tgapp-api.matchain.io/api/tgapp/v1/point/task/list', payload, {headers});
		if (response && response.status == 200) {
			console.log(`[#] Account ${stt} | Get task list complete`)
			return response.data.data
		} return null
	} catch (e) {
		console.error(`getTaskList error: ${e}`);
	}
}
async function completeTask(stt, token, axios, name, uid) {
	try {
		const headers = {
				'Authorization': token,
			}
		const payload = {
			'type': name,
			'uid': uid,
		}
		const response = await axios.post('https://tgapp-api.matchain.io/api/tgapp/v1/point/task/complete', payload, {headers});
		if (response && response.status == 200) {
			console.log(`[#] Account ${stt} | Complete task ${name}`)
		}
	} catch (e) {
		console.error(`completeTask error: ${e}`);
	}
}
async function claimTask(stt, token, axios, name, uid) {
	try {
		const headers = {
				'Authorization': token,
			}
		const payload = {
			'type': name,
			'uid': uid,
		}
		const response = await axios.post('https://tgapp-api.matchain.io/api/tgapp/v1/point/task/claim', payload, {headers});
		if (response && response.status == 200) {
			console.log(`[#] Account ${stt} | Claim task ${name}`)
		}
	} catch (e) {
		console.error(`claimTask error: ${e}`);
	}
}
async function getRefBalance(stt, token, axios, uid) {
	try {
		const headers = {
				'Authorization': token,
			}
		const payload = {
			'uid': uid,
		}
		const response = await axios.post('https://tgapp-api.matchain.io/api/tgapp/v1/point/invite/balance', payload, {headers});
		if (response && response.status == 200) {
			return response.data.data.balance;
		} else return 0
	} catch (e) {
		console.error(`getRef error: ${e}`);
	}
}
async function claimRef(stt, token, axios, uid) {
	try {
		const headers = {
				'Authorization': token,
			}
		const payload = {
			'uid': uid
		}
		const response = await axios.post('https://tgapp-api.matchain.io/api/tgapp/v1/point/invite/claim', payload, {headers});
		if (response && response.status == 200) {
			console.log(`[#] Account ${stt} | Claim ref successful`)
		}
	} catch (e) {
		console.error(`claimRef error: ${e}`);
	}
}
async function playGame(stt, token, axios) {
	try {
		const headers = {
				'Authorization': token,
			}
		const response = await axios.get('https://tgapp-api.matchain.io/api/tgapp/v1/game/play', {headers});
		if (response && response.status == 200) {
			console.log(`[#] Account ${stt} | Playing game...`)
			return response.data.data
		}
	} catch (e) {
		console.error(`playGame error: ${e}`);
	}
}
async function claimGame(stt, token, axios, gameId) {
	try {
		const headers = {
				'Authorization': token,
			}
		const point = Math.floor(Math.random() * (150 - 100 + 1)) + 100;
		const payload = {
			'game_id': gameId,
			'point': point
		}
		const response = await axios.post('https://tgapp-api.matchain.io/api/tgapp/v1/game/play', payload, {headers});
		if (response && response.status == 200) {
			console.log(`[#] Account ${stt} | Claim ${payload.point} point`)
		}
		return response
	} catch (e) {
		if (e !== 'AxiosError: Request failed with status code 404'){
			console.error(`claimGame error: ${e}`);
		}
		return e.response
	}
}
async function waitGame(stt, seconds) {
	for (let i = seconds; i >= 0; i--) {
		process.stdout.write(`[*] Account ${stt} | Wait ${i} seconds`);
		readline.cursorTo(process.stdout, 0);
		await new Promise(resolve => setTimeout(resolve, 1000));
	}
}

//
async function main(stt, account, axios)
{
    try{
        let urlData = querystring.unescape(account).split('tgWebAppData=')[1].split('&tgWebAppVersion')[0];
        
    	let loginInfo = await login(stt, urlData, axios);
		let access_token = loginInfo.token
		let uid = loginInfo.uid
        if(access_token){
			await getQuiz(stt, access_token, axios)
            const accountInfo = await getAccountInfo(stt, access_token, axios, uid);
			const checkFarm = await checkClaimFarm(stt, access_token, axios, uid)
			if (checkFarm===1) {
				await claimFarm(stt, access_token, axios, uid)
				await startFarm(stt, access_token, axios, uid)
			} else if (checkFarm === 0) {
				startFarm(stt, access_token, axios, uid)
			}
			const dailyBoostData = await getDailyBoost(stt, access_token, axios)
			if (dailyBoostData[0].current_count < dailyBoostData[0].task_count && accountInfo.Balance >= dailyBoostData[0].point ) {
				await dailyBooster(stt, access_token, axios, uid)
			}

			const refBalance = await getRefBalance(stt, access_token, axios, uid) 
			if (refBalance) {
				await claimRef(stt, access_token, axios, uid)
			}
			
			const taskList = await getTaskList(stt, access_token, axios, uid)
			const availableTasks = [];
			['Tasks', 'Extra Tasks'].forEach(taskType => {
				if (taskList[taskType]) {
				  availableTasks.push(...taskList[taskType].filter(task => !task.complete));
				}
			  });
			for (const key in availableTasks) {
				await completeTask(stt, access_token, axios, availableTasks[key].name, uid)
				await claimTask(stt, access_token, axios, availableTasks[key].name, uid)
			}
			while (true) {
				const gameData = await playGame(stt, access_token, axios)
				if (gameData.game_id){
					await waitGame(stt, 30)
					const res = await claimGame(stt, access_token, axios, gameData.game_id)
					if (res.status!=200) {
						console.log(`[#] Account ${stt} | Lỗi chơi game: ${res.data.message}`);
						continue;
					}
					console.log(`[#] Account ${stt} | Play game successful`);
					if (!gameData.game_count) {
						console.log(green.bold(`[#] Account ${stt} | Hết vé`));
						break;
					} else console.log(yellow.bold(`[#] Account ${stt} | Còn ${gameData.game_count} vé`));
				}
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
					const axiosInstance = createAxiosInstance(proxy, account);
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
