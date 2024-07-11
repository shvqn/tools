import querystring from 'querystring';
import { countdown, randomInt, sleep, getData, convertSecondsToHMS, cPrx } from './utils.js';
import { cyan, yellow, blue, green, magenta } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";

//config
const accounts = getData("data_timefarm.txt");
const proxies = getData("proxy.txt");

let timeRerun = 5*60; //phút time nghỉ mỗi lượt chạy
let numberThread = 1; // số luồng chạy /1 lần 

let auto_farm = true; // auto farm
let auto_claim_ref = true; // auto claim ref reward
let auto_task = true; // auto task

let auto_upgrade_clock = true; //auto upgrade clock
let max_level_clock = 6; // max level clock  (max = 3)

let auto_stake = true 
let stake_type = "1"
let stake_during = "3"

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
      'origin': 'https://tg-tap-miniapp.laborx.io',
      'pragma': 'no-cache',
      'priority': 'u=1, i',
      'referer': 'https://tg-tap-miniapp.laborx.io/',
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
async function getFarmInfo(stt, token, axios, retryDelay = 5000, maxRetries = 5) {
    let retries = 0;
    const headers = {
        Authorization: `Bearer ${token}`,
    };

    const payload = {};

    while (retries < maxRetries) {
        try {
            const response = await axios.get("https://tg-bot-tap.laborx.io/api/v1/farming/info", { headers: headers });

            if (response && response.status === 200) {
                return response.data;
            } else if (response && response.status === 304) {
                console.log(`[i] Account ${stt} | getFarmInfo response 304: Not Modified. Retrying...`);
                retries++;
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            } else {
                console.log(`[e] Account ${stt} | getFarmInfo unexpected response status: ${response.status}`);
                break;
            }
        } catch (e) {
            console.log(`[e] Account ${stt} | getFarmInfo err: ${e}`);
            break;
        }
    }

    console.log(`[e] Account ${stt} | getFarmInfo failed after ${retries} retries`);
    return null;
}


async function getFarmFinish(stt, token, axios) {
	try {
		const headers = {
			Authorization: `Bearer ${token}`,
		};

		const payload = {};

		const response = await axios.post("https://tg-bot-tap.laborx.io/api/v1/farming/finish", payload, { headers: headers });

		if (response && response.status == 200) {
			return response.data;
		}
	} catch (e) {
		console.log(`[e] Account ${stt} | getFarmFinish err: ${e}`);
	}
}
async function getFarmStart(stt, token, axios) {
	try {
		const headers = {
			Authorization: `Bearer ${token}`,
		};

		const payload = {};

		const response = await axios.post("https://tg-bot-tap.laborx.io/api/v1/farming/start", payload, { headers: headers });

		if (response && response.status == 200) {
			return response.data;
		}
	} catch (e) {
		console.log(`[e] Account ${stt} | getFarmStart err: ${e}`);
	}
}
async function getBalanceInfo(stt, token, axios) {
	try {
		const headers = {
			Authorization: `Bearer ${token}`,
		};

		const payload = {};

		const response = await axios.get("https://tg-bot-tap.laborx.io/api/v1/balance", { headers: headers });

		if (response && response.status == 200) {
			return response.data;
		}
	} catch (e) {
		console.log(`[e] Account ${stt} | getBalanceInfo err: ${e}`);
	}
}
async function getClaimRef(stt, token, axios) {
	try {
		const headers = {
			Authorization: `Bearer ${token}`,
		};

		const payload = {};

		const response = await axios.post("https://tg-bot-tap.laborx.io/api/v1/balance/referral/claim", payload, { headers: headers });

		if (response && response.status == 200) {
			return response.data;
		}
	} catch (e) {
		console.log(`[e] Account ${stt} | getClaimRef err: ${e}`);
	}
}

async function getTaskInfo(stt, token, axios) {
	try {
		const headers = {
			Authorization: `Bearer ${token}`,
		};

		const response = await axios.get("https://tg-bot-tap.laborx.io/api/v1/tasks", { headers: headers });

		if (response && response.status == 200) {
			return response.data;
		}
	} catch (e) {
		console.log(`[e] Account ${stt} | getTaskInfo err: ${e}`);
	}
}

async function submitTask(stt, token, axios, idTask) {
	try {
		const headers = {
			Authorization: `Bearer ${token}`,
		};

		const payload = {};

		const response = await axios.post(`https://tg-bot-tap.laborx.io/api/v1/tasks/${idTask}/submissions`, payload, { headers: headers });

		if (response && response.status == 200) {
			return response.data;
		}
	} catch (e) {
		console.log(`[e] Account ${stt} | submitTask err: ${e}`);
	}
}

async function claimTask(stt, token, axios, idTask) {
	try {
		const headers = {
			Authorization: `Bearer ${token}`,
		};

		const payload = {};

		let response = await axios.post(`https://tg-bot-tap.laborx.io/api/v1/tasks/${idTask}/claims`, payload, { headers: headers });

		if (response && response.status == 200) {
			if(response.data == "OK"){
				response = await axios.get(`https://tg-bot-tap.laborx.io/api/v1/tasks/${idTask}`, {headers: headers});
				if (response && response.status == 200) {
					return response.data;
				}
		}
		}
	} catch (e) {
		console.log(`[e] Account ${stt} | claimTask err: ${e}`);
	}
}
async function getStake(stt, token, axios) {
	try {
		const headers = {
			Authorization: `Bearer ${token}`,
		};

		const response = await axios.get(`https://tg-bot-tap.laborx.io/api/v1/staking/active`, { headers: headers });
		if (response && response.status == 200) {
			return response.data.stakes;
		}
	} catch (e) {
		console.log(`[e] Account ${stt} | getStake err: ${e}`);
	}
}
async function staking(stt, token, axios, stakeBalance) {
	try {
		const headers = {
			Authorization: `Bearer ${token}`,
		};

		const payload = {
			amount: stakeBalance,
			optionId: stake_type
		};

		const response = await axios.post(`https://tg-bot-tap.laborx.io/api/v1/staking`, payload, { headers: headers });

		if (response && response.status == 200) {
			console.log(yellow.bold(`[#] Account ${stt} | Stake ${stakeBalance} point ${stake_during} days`));
		}
	} catch (e) {
		console.log(`[e] Account ${stt} | staking err: ${e}`);
	}
}
async function claimStake(stt, token, axios, stakeId) {
	try {
		const headers = {
			Authorization: `Bearer ${token}`,
		};

		const payload = {
			id: stakeId
		};

		const response = await axios.post(`https://tg-bot-tap.laborx.io/api/v1/staking/claim`, payload, { headers: headers });

		if (response && response.status == 200) {
			console.log(blue.bold(`[#] Account ${stt} | Claim stake successful, Balance: ${response.data.balance}`));
		}
	} catch (e) {
		console.log(`[e] Account ${stt} | claimStake err: ${e}`);
	}
}
async function levelUpgrade(stt, token, axios) {
	try {
		const headers = {
			Authorization: `Bearer ${token}`,
		};

		const payload = {};

		let response = await axios.post(`https://tg-bot-tap.laborx.io/api/v1/me/level/upgrade`, payload, { headers: headers });

		if (response && response.status == 200) {
			return response.data;
		}
	} catch (e) {
		console.log(`[e] Account ${stt} | claimTask err: ${e}`);
	}
}
//
async function main(stt, account, axios)
{
    try{
		const access_token = account;
		console.log(cyan.bold(`[#] Account ${stt} | Login...`));
		await sleep(5);
        if(access_token){
					console.log(cyan.bold(`[#] Account ${stt} | Get Farm Info...`));
					await sleep(5);
					let farmInfo = await getFarmInfo(stt, access_token, axios);
					if(auto_farm){
						console.log(`[#] Account ${stt} | Balance: ${farmInfo.balance}`)
						if(farmInfo){
								if(farmInfo.activeFarmingStartedAt == null){
									console.log(cyan.bold(`[#] Account ${stt} | Start Claim ...`));
									let firtClaim = await getFarmStart(stt, access_token, axios);
									if(firtClaim){
										let timeDur = firtClaim.farmingDurationInSec;
										if(timeDur > 0){
											console.log(green.bold(`[#] Account ${stt} | Start Farm Success | Duration before: ${convertSecondsToHMS(timeDur)}`));
										}
									}
								}else{
									const startedAt = new Date(farmInfo.activeFarmingStartedAt);
									const now = new Date();

									if ((now - startedAt) / (1000 * 60 * 60) >= 4){
										console.log(cyan.bold(`[#] Account ${stt} | Claim Finish...`));
										await sleep(randomInt(2,5))
										let claimFarm = await getFarmFinish(stt, access_token, axios);
										if(claimFarm){
											let farmInfo2 = await getFarmInfo(stt, access_token, axios);
											if(farmInfo2 && farmInfo2.activeFarmingStartedAt == null){
												console.log(cyan.bold(`[#] Account ${stt} | Start Claim...`));
												let firtClaim = await getFarmStart(stt, access_token, axios);
												if(firtClaim){
													let timeDur = firtClaim.farmingDurationInSec;
													if(timeDur > 0){
														console.log(green.bold(`[#] Account ${stt} | Start Farm Success | Duration before: ${convertSecondsToHMS(timeDur)}`));
													}
												}
											}
										}
									}
								}
							}
					}

					if(auto_claim_ref){
						await sleep(2);
						let getBalance = await getBalanceInfo(stt, access_token, axios);
						if(getBalance) {
							if(getBalance.referral.availableBalance > 0){
								console.log(cyan.bold(`[#] Account ${stt} | Claim Referral Friend!`));
								await sleep(2);
								let claimRef = await getClaimRef(stt, access_token, axios);
								console.log(cyan.bold(`[#] Account ${stt} | Claim Referral Friend Success!, Balance (+): ${getBalance.referral.availableBalance}`));
							}
						}
					}

					if(auto_task){
						console.log(yellow.bold(`[#] Account ${stt} | Open Auto Task!`));
						let subDone1 = false;
						await sleep(2);
						
							let getTask = await getTaskInfo(stt, access_token, axios);
							if(getTask) {
								const taskIncom = getTask.filter(item => !item.submission);
								if(taskIncom.length > 0){
									console.log(cyan.bold(`[#] Account ${stt} | Start ${taskIncom.length} Task!`));
									for (let i = 0; i < taskIncom.length; i++) {
											let idTask = taskIncom[i].id;
											let nameTask = taskIncom[i].title;
											let rewardTask = taskIncom[i].reward;
											console.log(blue.bold(`[#] Account ${stt} | Start task: ${nameTask} - Reward ${rewardTask}`));
											sleep(2);
											let checkT = await submitTask(stt, access_token, axios, idTask);
											if(checkT == "OK") {
												console.log(magenta.bold(`[#] Account ${stt} | Submit task: ${nameTask} - Reward ${rewardTask} - Pending..`));
												subDone1 = true;
											}
											sleep(5);
									}
								}
							}
						
							if(subDone1){
								console.log(yellow.bold(`[#] Account ${stt} | Sleep 65s To completed task..`));
								await sleep(65);
							}

							let getTask2 = await getTaskInfo(stt, access_token, axios);
							if(getTask2) {
								const taskCheck = getTask2.filter(item => item.submission && item.submission.status == "COMPLETED");
								if(taskCheck.length > 0){
									console.log(cyan.bold(`[#] Account ${stt} | Start ${taskCheck.length} Task!`));
									for (let i = 0; i < taskCheck.length; i++) {
										let idTask = taskCheck[i].id;
										let nameTask = taskCheck[i].title;
										let rewardTask = taskCheck[i].reward;
										console.log(magenta.bold(`[#] Account ${stt} | Check task: ${nameTask} - Reward ${rewardTask}`));
										sleep(randomInt(5,10));
										let claimT = await claimTask(stt, access_token, axios, idTask);
										if(claimT) {
											console.log(green.bold(`[#] Account ${stt} | Claimed task: ${nameTask} - Reward ${claimT.reward} - DONE`));
										}
										sleep(5);
									}
								}
							}
					}

					if (auto_stake) {
						let stakeData = await getStake(stt, access_token, axios)
						const now = new Date()
						if (stakeData) {
							for (const stake in stakeData) {
								if (now >= stake.finishAt) {
									stakeData = await claimStake(stt, access_token, axios, stake.id)
								}
							}
						}
						if (Object.keys(stakeData).length < 3 && farmInfo.balance) {
							await staking(stt, access_token, axios, farmInfo.balance)
						}
					}

				// 	if(auto_upgrade_clock){
				// 		let { level } = data;

				// 		if(level < max_level_clock && level != 4){
				// 			for (let i = level; i < max_level_clock; i++) {
				// 				console.log(cyan.bold(`[#] Account ${stt} | Upgrade Clock...`));
                // await sleep(randomInt(1,4));
                // let upClock = await levelUpgrade(stt, access_token, axios);
                // if(upClock) {
                //   console.log(green.bold(`[#] Account ${stt} | Upgrade Clock Lvl: ${level + i} Success!`));
				// 					await sleep(randomInt(2,5));
                // }
				// 			}
				// 		}
				// 	}

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
					const axiosInstance = createAxiosInstance(proxy);
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
