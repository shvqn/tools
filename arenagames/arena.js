import querystring from 'querystring';
import { countdown, randomInt, sleep, getData, getUserDataFromUrl, cPrx, formatNum } from './utils.js';
import { cyan, yellow, blue, green } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";
import readline from 'readline';

const accounts = getData("data_blum.txt");
const proxies = getData("proxy.txt");

let timeRerun = 8*60; //phút time nghỉ mỗi lượt chạy
let numberThread = 1; // số luồng chạy /1 lần 

let auto_farm = true; //auto claim
let auto_farm_ref = true; //auto claim ref
let auto_task = true;
//

function createAxiosInstance(proxy) {
	return new AxiosHelpers({
    headers: {
			'accept': 'application/json, text/plain, */*',
			'accept-language': 'vi',
			'cache-control': 'no-cache',
			'origin': 'https://bot-coin.arenavs.com',
			'pragma': 'no-cache',
			'priority': 'u=1, i',
			'referer': 'https://bot-coin.arenavs.com/',
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

async function profile(stt, token, axios) {
	try {
		const headers = {
			'at': token,
		};

		const payload = {
		};
		const response = await axios.get(`https://bot.arenavs.com/v1/profile`, { headers });

		if (response && response.status == 200) {
			return response.data.data;
		}

	} catch (e) {
		console.log(`[*] Account ${stt} | profile: ${e}`);
	}
}

async function getArena(stt, token, axios, url) {
	try {
		const headers = {
			'at': token,
		};

		const payload = {
		};
		const response = await axios.get(url, { headers });

		if (response && response.status == 200) {
			return response.data.data;
		}

	} catch (e) {
		console.log(`[*] Account ${stt} | getArena: ${e}`);
	}
}

async function farmCoin(stt, token, axios) {
	try {
		const headers = {
			'at': token,
		}

		const payload = {}

		const response = await axios.post('https://bot.arenavs.com/v1/profile/farm-coin', payload, { headers });
		if (response && response.status == 200) {
			return response.data;
		}
	}catch (e) {
		console.log(`[*] Account ${stt} | farmCoin: ${e}`);
	}
}
async function claimRef(stt, token, axios) {
	try {
		const headers = {
			'At': token,
		}
		const payload = {}
		const response = await axios.post('https://bot.arenavs.com/v1/profile/get-ref-coin', payload, { headers });
		if (response && response.status == 201) {
			return response.data;
		}
	}catch (e) {
		console.log(`[*] Account ${stt} | claimRef: ${e}`);
	}
}

async function getTasks(stt, token, axios) {
	try {
		const headers = {
			'at': token,
		};

		const payload = {
		};
		const response = await axios.get(`https://bot.arenavs.com/v1/profile/tasks?page=1&limit=20`, { headers });

		if (response && response.status == 200) {
			return response.data.data;
		}

	} catch (e) {
		console.log(`[*] Account ${stt} | getTask: ${e}`);
	}
}

async function submitTask(stt, token, axios, idTask) {
	try {
		const headers = {
			'at': token,
		}
		const payload = {}
		const response = await axios.post(`https://bot.arenavs.com/v1/profile/tasks/${idTask}`, payload, { headers });
		if (response && response.status == 201) {
			return response.data;
		}
	}catch (e) {
		console.log(`[*] Account ${stt} | submitTask: ${e}`);
	}
}
async function claimTask(stt, token, axios, idTask) {
	try {
		const headers = {
			'at': token,
		}
		const payload = {}
		const response = await axios.post(`https://bot.arenavs.com/v1/profile/tasks/${idTask}/claim`, payload, { headers });
		if (response && response.status == 201) {
			return response.data;
		}
	}catch (e) {
		console.log(`[*] Account ${stt} | claimTask error: ${e}`);
	}
}
async function getAttemptsLeft(stt, token, axios) {
	try {
		const headers = {
			'at': token,
		}
		const response = await axios.get(`https://bot.arenavs.com/v1/game/attempts-left`, { headers });
		if (response && response.status == 200) {
			return response.data.data.quantity;
		} else return 0
	}catch (e) {
		console.log(`[*] Account ${stt} | getAttemptsLeft error: ${e}`);
	}
}
async function startGame(stt, token, axios) {
	try {
		const headers = {
			'at': token,
		}
		const payload = {}
		await axios.post("https://bot.arenavs.com/v1/game/start", payload, { headers });
	}
	catch (e) {
		if (e.response) {
			console.log(`[#] Account ${stt} | ${e.response.data.message}`);
			return true
		} else return false
	}
}
async function waitGame(stt, seconds) {
	for (let i = seconds; i >= 0; i--) {
		process.stdout.write(`[*] Account ${stt} | Wait ${i} seconds`);
		readline.cursorTo(process.stdout, 0);
		await new Promise(resolve => setTimeout(resolve, 1000));
	}
}
async function stopGame(stt, token, axios, gameData) {
	try {
		const headers = {
			'at': token,
		}
		const payload = {
			...gameData,
			"time": "60000"
		}
		const response = await axios.post(`https://bot.arenavs.com/v1/game/stop`, payload, { headers });
		if (response && response.status == 201) {
			console.log(`[#] Account ${stt} | Claimed ${gameData.xp} xp from game`);
		} 
	}catch (e) {
		console.log(`[*] Account ${stt} | stopGame error: ${e}`);
	}
}

//
async function main(stt, account, axios)
{
    try{
        let urlData = querystring.unescape(account).split('tgWebAppData=')[1].split('&tgWebAppVersion')[0];
		let userData = getUserDataFromUrl(urlData);
		let token = userData.id;
		console.log(cyan.bold(`[#] Account ${stt} | Auth...`));
		await sleep(5);
        let infoAcc = await profile(stt, token, axios);

        if(infoAcc){
			let {username, balance, storage, farmEnd} = infoAcc;
			console.log(blue.bold(`[*] Account ${stt} | User: ${username}, XP: ${formatNum(balance.$numberDecimal)}, Storage: ${formatNum(storage.$numberDecimal)}!`));

			if(auto_farm){
				console.log(cyan.bold(`[*] Account ${stt} | Auto Farm...`));
				const currentTime = Date.now();
				if (currentTime >= farmEnd) {
					await sleep(randomInt(1,5));
					let farmRs = await farmCoin(stt, token, axios);
					if (farmRs){
						console.log(green.bold(`[*] Account ${stt} | Farming Success!, XP(+): ${formatNum(storage.$numberDecimal)}`));
					}else{
						console.log(yellow.bold(`[*] Account ${stt} | Farm Waiting...`));
					}
				}
			}

			if(auto_farm_ref){
				console.log(cyan.bold(`[*] Account ${stt} | Claim Ref...`));
				await sleep(randomInt(1,5));
				let clRef = await claimRef(stt, token, axios);
				if(clRef)
				{
					console.log(green.bold(`[*] Account ${stt} | Claim Ref Success!`));
				}
			}

			if(auto_task){

				let tasksAll;
				console.log(cyan.bold(`[*] Account ${stt} | Auto Task...`));
				await sleep(randomInt(1,5));
				tasksAll = await getTasks(stt, token, axios);
				if(tasksAll){
					let { docs } = tasksAll;
					if(docs.length > 0){
						let taskPending = docs.filter(task => task.status == 'pending');
						if(taskPending.length > 0){
							for(const task of taskPending){
								let idTask = task._id;
								let titleTask = task.title;
								let xpTask = task.bonus.$numberDecimal;
								console.log(yellow.bold(`[*] Account ${stt} | Start Task: ${titleTask}, XP: ${formatNum(xpTask)}`));
								let sTask = await submitTask(stt, token, axios, idTask);
								if(sTask){
									let sl = randomInt(15,20);
									console.log(cyan.bold(`[*] Account ${stt} | Submit Task: ${titleTask}, XP: ${formatNum(xpTask)}, Sleep: ${sl}s`));
									await sleep(sl);
								}
							}
						}
					}
				}
				
				//check 2
				await sleep(randomInt(2,5));
				tasksAll = await getTasks(stt, token, axios);
				if(tasksAll){
					let { docs } = tasksAll;
					if(docs.length > 0){
						let taskClaim = docs.filter(task => task.status == 'completed');
						if(taskClaim.length > 0){
							for(const task of taskClaim){
								let idTask = task._id;
								let titleTask = task.title;
								let xpTask = task.bonus.$numberDecimal;
								console.log(yellow.bold(`[*] Account ${stt} | Claim Task: ${titleTask}, XP: ${formatNum(xpTask)}`));
								let cTask = await claimTask(stt, token, axios, idTask);
								if(cTask){
									console.log(green.bold(`[*] Account ${stt} | Claimed Task: ${titleTask}, XP(+): ${formatNum(xpTask)}`));
									await sleep(randomInt(3,5));
								}
							}
						}
					}
				}
			}
			let attemptsLeft = await getAttemptsLeft(stt, token, axios)
			while (attemptsLeft) {
				const gameData = {
					xp: Math.floor(Math.random() * (1000 - 500 + 1)) + 500,
					height: Math.floor(Math.random() * (35 - 20 + 1)) + 20,
					somersault: Math.floor(Math.random() * (80 - 50 + 1)) + 50,
				};
				let gameStarted = await startGame(stt, token, axios)
				if (gameStarted) {
					await waitGame(stt, 60);
					await stopGame(stt, token, axios, gameData)
					attemptsLeft--
				}
			}
		}



		console.log(blue.bold(`[*] Account ${stt} | Done!`));
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
