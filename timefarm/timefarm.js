import querystring from 'querystring';
import { countdown, randomInt, sleep, getData} from './utils.js';
import { cyan, yellow, blue, green, magenta, red, gray } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";

//config
const accounts = getData("token.txt");
const proxies = getData("proxy.txt");

let timeRerun = 4*60; //phút time nghỉ mỗi lượt chạy
let numberThread = 1; // số luồng chạy /1 lần 
let maxRetries = 3;

let auto_upgrade_clock = true; //auto upgrade clock
let max_level_clock = 6; // max level clock  (max = 3)

let auto_stake = true 
let stake_type = "1"
let stake_during = "3"
const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MjI4NzExNzUsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3MjI3ODQ3NzUsImF1ZCI6InRnLmFpLmpvYnMiLCJpc3MiOiJ0Zy5haS5qb2JzIiwic3ViIjoiNTkwNDU5OTI2OSIsImp0aSI6ImNkZDM1MThsemZwa29wMiJ9.UP_XqRtXTdkFcfEC8ulgzc-2FSeC7pIzHHA4t9hvVup4SAbwQaG2PfWk_FTYw_MH006NtAR2mvQmIXFEnm4bvIXUj54DyDhQMkAAvLM4VNonaKE8R6TzyiBQMFKnV6FCZafytoaZqyVE17H_OIsmY8O9-I2TUq-5tF19ygoScQHtL_mkozkgIhZwrcUMM2wRa7tz7uHWyltf6gfi2TiJsSSpGrZuuOIEZGen1reXGf6xxe_wcJqfwV67DY_-dpGRhwwQoitQjztMcuZVgkakwEDNFQGRPfo_kZyEL-5YpmvpoetUKAI4ugFydb5-piuhGLJWmdG5rt8rjDDOwrQ7eAiNN-QWXunTNwt6C8s3FG8l_-noUqIGMeSwn18_lv2-OyC8NQNt4daKCx9wOVL8s8sGUkVJynR0oRQIHhrG8gg7Yio3WRVPuT6219HTNa_Cb9Bx6LY-F-wMCTwoRXelzw2obnSTka1yCyfl2lXXyt6xz2mF13X3hDfLNKtGQTRRwvaimIPBdKkg-SdFFm-9hqif6_s2cIcnlTqtNSv11xpSX0vNYxpbwlxMGiEqA0LNcAt3H1iSaY1gnFy2f4fZLhvRZtKCFhx38TdBUM6GxRowmGkFRxnU0xaPkyYQkUb17qEqPZTVkcncRw0a_GM8XwNPSQaTIgqykE7JnXjPuyM"
switch (stake_type) {
	case "1":
		stake_during = "3"
		break;
	case "2":
		stake_during = "15"
		break;
	case "3":
		stake_during = "45"
		break;
	default: 
		console.log("Hãy nhập stake_type");
}
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
	  Authorization: `Bearer ${token}`,
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
async function getFarmInfo(stt, axios) {
    try {
		const response = await axios.get("https://tg-bot-tap.laborx.io/api/v1/farming/info");
		if (response && response.status === 200) {
			return response.data;
		} else return null
	} catch (e) {
		console.log(red.bold(`[Nauquu.Timefarm] Account ${stt} | getFarmInfo err: ${e}`));
		return null
	}
}
async function claimFarm(stt, axios) {
	try {
		const response = await axios.post("https://tg-bot-tap.laborx.io/api/v1/farming/finish");
		if (response && response.status == 200) {
			console.log(cyan.bold(`[Nauquu.Timefarm] Account ${stt} | Claim Farm`));
		}
	} catch (e) {
		console.log(red.bold(`[Nauquu.Timefarm] Account ${stt} | claimFarm err: ${e}`));
	}
}
async function startFarm(stt, axios) {
	try {
		const response = await axios.post("https://tg-bot-tap.laborx.io/api/v1/farming/start");
		if (response && response.status == 200) {
			console.log(cyan.bold(`[Nauquu.Timefarm] Account ${stt} | Start Farm`));
		}
	} catch (e) {
		console.log(red.bold(`[Nauquu.Timefarm] Account ${stt} | startFarm err: ${e}`));
	}
}
async function getBalanceInfo(stt, axios) {
	try {
		const response = await axios.get("https://tg-bot-tap.laborx.io/api/v1/balance");
		if (response && response.status == 200) {
			const balance = response.data;
			if(balance.referral.availableBalance > 0){
				await getClaimRef(stt, axios);
				console.log(yellow.bold(`[Nauquu.Timefarm] Account ${stt} | Claim Referral Friend, Balance =+ ${balance.referral.availableBalance}`));
			}
		}
	} catch (e) {
		console.log(red.bold(`[Nauquu.Timefarm] Account ${stt} | getBalanceInfo err: ${e}`));
	}
}
async function getClaimRef(stt, axios) {
	try {
		const response = await axios.post("https://tg-bot-tap.laborx.io/api/v1/balance/referral/claim");
		if (response && response.status == 200) {
			return response.data;
		}
	} catch (e) {
		console.log(red.bold(`[Nauquu.Timefarm] Account ${stt} | getClaimRef err: ${e}`));
	}
}

async function getTaskInfo(stt, axios) {
	try {
		const response = await axios.get("https://tg-bot-tap.laborx.io/api/v1/tasks");
		if (response && response.status == 200) {
			return response.data;
		}
	} catch (e) {
		console.log(red.bold(`[Nauquu.Timefarm] Account ${stt} | getTaskInfo err: ${e}`));
	}
}

async function submitTask(stt, axios, idTask) {
	try {
		const response = await axios.post(`https://tg-bot-tap.laborx.io/api/v1/tasks/${idTask}/submissions`);
		if (response && response.status == 200) {
			return response.data;
		}
	} catch (e) {
		console.log(red.bold(`[Nauquu.Timefarm] Account ${stt} | submitTask err: ${e}`));
	}
}

async function claimTask(stt, axios, idTask) {
	try {
		let response = await axios.post(`https://tg-bot-tap.laborx.io/api/v1/tasks/${idTask}/claims`);
		if (response && response.status == 200) {
			if(response.data == "OK"){
				response = await axios.get(`https://tg-bot-tap.laborx.io/api/v1/tasks/${idTask}`);
				if (response && response.status == 200) {
					return response.data;
				}
			}
		}
	} catch (e) {
		console.log(red.bold(`[Nauquu.Timefarm] Account ${stt} | claimTask err: ${e}`));
	}
}
async function getStake(stt, axios) {
	try {
		const response = await axios.get(`https://tg-bot-tap.laborx.io/api/v1/staking/active`);
		if (response && response.status == 200) {
			return response.data.stakes;
		}
	} catch (e) {
		console.log(red.bold(`[Nauquu.Timefarm] Account ${stt} | getStake err: ${e}`));
	}
}
async function staking(stt, axios, stakeBalance) {
	try {
		const headers = {};

		const payload = {
			amount: stakeBalance,
			optionId: stake_type
		};

		const response = await axios.post(`https://tg-bot-tap.laborx.io/api/v1/staking`, payload, { headers });

		if (response && response.status == 200) {
			console.log(yellow.bold(`[Nauquu.Timefarm] Account ${stt} | Stake ${stakeBalance} point ${stake_during} days`));
		}
	} catch (e) {
		console.log(red.bold(`[Nauquu.Timefarm] Account ${stt} | staking err: ${e}`));
	}
}
async function claimStake(stt, axios, stakeId) {
	try {
		const headers = {};

		const payload = {
			id: stakeId
		};
		const response = await axios.post(`https://tg-bot-tap.laborx.io/api/v1/staking/claim`, payload, { headers });
		if (response && response.status == 200) {
			console.log(blue.bold(`[Nauquu.Timefarm] Account ${stt} | Claim stake, Balance: ${response.data.balance}`));
		}
	} catch (e) {
		console.log(red.bold(`[Nauquu.Timefarm] Account ${stt} | claimStake err: ${e}`));
	}
}
async function levelUpgrade(stt, axios) {
	try {
		let response = await axios.post(`https://tg-bot-tap.laborx.io/api/v1/me/level/upgrade`);
		if (response && response.status == 200) {
			return response.data;
		}
	} catch (e) {
		console.log(red.bold(`[Nauquu.Timefarm] Account ${stt} | claimTask err: ${e}`));
	}
}
//
async function main(stt, axios)
{
    try{
		console.log(blue.bold(`[Nauquu.Timefarm] Account ${stt} | Login...`));
		let retries = 1
		while (true){
			const farmInfo = await getFarmInfo(stt, axios);
			if (!farmInfo) {
				if (retries == maxRetries) {
					console.log(red.bold(`[Nauquu.Timefarm] Account ${stt} | Expired token`));
					break;
				}
				await sleep(5)
				retries++
			} else {
				console.log(green.bold(`[Nauquu.Timefarm] Account ${stt} | Balance: ${farmInfo.balance}`))
				if(farmInfo.activeFarmingStartedAt == null){
					await startFarm(stt, axios);
				} else {
					const startedAt = new Date(farmInfo.activeFarmingStartedAt);
					const now = new Date();
					const farmFinishAt = new Date(startedAt.getTime() + farmInfo.farmingDurationInSec*1000)
					if (now > farmFinishAt){
						await claimFarm(stt, axios)
						await sleep(randomInt(2,5))
						await startFarm(stt, axios)
					}
				}
				await getBalanceInfo(stt, axios);
	
				let subDone1 = false;
				let getTask = await getTaskInfo(stt, axios);
				if(getTask) {
					const taskIncom = getTask.filter(item => !item.submission);
					if(taskIncom.length > 0){
						for (let i = 0; i < taskIncom.length; i++) {
							let idTask = taskIncom[i].id;
							let nameTask = taskIncom[i].title;
							let rewardTask = taskIncom[i].reward;
							console.log(magenta.bold(`[Nauquu.Timefarm] Account ${stt} | Start task: ${nameTask} - Reward ${rewardTask}`));
							sleep(2);
							let checkT = await submitTask(stt, axios, idTask);
							if(checkT == "OK") {
								console.log(magenta.bold(`[Nauquu.Timefarm] Account ${stt} | Submit task: ${nameTask} - Reward ${rewardTask} - Pending..`));
								subDone1 = true;
							}
							sleep(5);
						}
					}
				}
				if(subDone1){
					console.log(magenta.bold(`[Nauquu.Timefarm] Account ${stt} | Sleep 65s To completed task..`));
					await sleep(65);
				}
				let getTask2 = await getTaskInfo(stt, axios);
				if(getTask2) {
					const taskCheck = getTask2.filter(item => item.submission && item.submission.status == "COMPLETED");
					if(taskCheck.length > 0){
						for (let i = 0; i < taskCheck.length; i++) {
							let idTask = taskCheck[i].id;
							let nameTask = taskCheck[i].title;
							let rewardTask = taskCheck[i].reward;
							console.log(magenta.bold(`[Nauquu.Timefarm] Account ${stt} | Check task: ${nameTask} - Reward ${rewardTask}`));
							sleep(randomInt(5,10));
							let claimT = await claimTask(stt, axios, idTask);
							if(claimT) {
								console.log(magenta.bold(`[Nauquu.Timefarm] Account ${stt} | Claimed task: ${nameTask} - Reward ${claimT.reward} - DONE`));
							}
							sleep(5);
						}
					}
				}
				if (auto_stake){
					let stakeData = await getStake(stt, axios)
					const now = new Date()
					if (stakeData) {
						for (const stake in stakeData) {
							if (now >= stake.finishAt) {
								stakeData = await claimStake(stt, axios, stake.id)
							}
						}
					}
					if (Object.keys(stakeData).length < 3 && farmInfo.balance) {
						await staking(stt, axios, farmInfo.balance)
					}
				}
				if(auto_upgrade_clock){
					let { level } = data;
					if(level < max_level_clock && level != 4){
						for (let i = level; i < max_level_clock; i++) {
							await sleep(randomInt(1,4));
							let upClock = await levelUpgrade(stt, axios);
							if(upClock) {
								console.log(green.bold(`[Nauquu.Timefarm] Account ${stt} | Upgrade Clock Lvl: ${level + i}`));
								await sleep(randomInt(2,5));
							}
						}
					}
				}
				console.log(blue.bold(`[Nauquu.Timefarm] Account ${stt} | Done!`));
				break;
			}
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
		numberThread = countPrx;
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
					let checkIp = await checkIP(axiosInstance);
					console.log(`[Nauquu.Timefarm] Account ${stt} | IP: ${checkIp}`);
					await main(stt, axiosInstance);
			}
		})
		console.log(gray.bold(`Number of thread: ${tasks.length}`));
		await Promise.all(tasks);
	}
}


// default
async function checkIP(axios) {
	try {
			const rs = await axios.get("https://api.myip.com");
			const ip = rs.data?.ip;
			const country = rs.data?.country;
			return `${ip} - ${country}`;
	} catch (err) {
			console.log(red.bold("Error IP"));
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