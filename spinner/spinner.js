import querystring from 'querystring';
import { countdown, randomInt, sleep, getData } from './utils.js';
import { cyan, yellow, blue, green } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";
import moment from 'moment-timezone';

const accounts = getData("data_spin.txt");
const proxies = getData("proxy.txt");

let timeRerun = 5*60; //phút time nghỉ mỗi lượt chạy
let numberThread = 1; // số luồng chạy /1 lần 

let auto_farm = true; // auto farm
let auto_claim_boxs = true; // auto claim box 
let auto_task = true; // auto task 
let auto_upgdate_spin = true; // auto update spin
let max_spin_level = 12; //max level spin
// 

function createAxiosInstance(proxy) {
	return new AxiosHelpers({
		headers: {
			"accept": "*/*",
			"accept-language": "vi,vi-VN;q=0.9,fr-FR;q=0.8,fr;q=0.7,en;q=0.6",
			"content-type": "application/json",
			"priority": "u=1, i",
			"sec-ch-ua": "\"Google Chrome\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"",
			"sec-ch-ua-mobile": "?0",
			"sec-ch-ua-platform": "\"Windows\"",
			"sec-fetch-dest": "empty",
			"sec-fetch-mode": "cors",
			"sec-fetch-site": "same-site",
			"Referer": "https://spinner.timboo.pro/",
			"Referrer-Policy": "strict-origin-when-cross-origin"
		},
		proxy: proxy ? proxy : false,
	});
}
//end config
// main

async function login(stt, userData, axios) {
	try {
		const headers = {};

		const payload = {
			initData: userData
		};

		const response = await axios.post('https://api.timboo.pro/register', payload, { headers: headers });

		if (response && response.status == 200) {
			console.log(green.bold(`[*] Account ${stt} | ${response.data.message}`));
			return true;
		}
		return false;
	} catch (e) {
		console.log(`[*] Account ${stt} | login err: ${e}`);
		return false;
	}
}

async function getUserData(stt, userData, axios)
{
	try{
		const headers = {};

		const payload = {
			initData: userData
		};

		const response = await axios.post('https://api.timboo.pro/get_data', payload, { headers: headers });

		if (response && response.status == 200) {
			return response.data;
		}
		return null;
	}catch(e){
		console.log(`[*] Account ${stt} | getUserData err: ${e}`);
		return null;
	}
}

async function initDataUser(stt, userData, axios)
{
	try{
		const headers = {};

		const payload = {
			initData: userData
		};

		const response = await axios.post('https://back.timboo.pro/api/init-data', payload, { headers: headers });

		if (response && response.status == 200) {
			return response.data;
		}
		return null;
	}catch(e){
		console.log(`[*] Account ${stt} | initDataUser err: ${e}`);
		return null;
	}
}

async function submitTaps(stt, userData, axios, clicks)
{
	try{
		const headers = {};

		const payload = {
			data: {
				clicks: clicks,
				isClose: null
			},
			initData: userData
		};

		const response = await axios.post('https://back.timboo.pro/api/upd-data', payload, { headers: headers });

		if (response && response.status == 200) {
			return response.data;
		}
		return null;
	}catch(e){
		// console.log(`[*] Account ${stt} | updatTaps err: ${e}`);
		return null;
	}
}

async function repairSpin(stt, userData, axios)
{
	try{
		const headers = {};

		const payload = {
			initData: userData
		};

		const response = await axios.post('https://back.timboo.pro/api/repair-spinner', payload, { headers: headers });

		if (response && response.status == 200) {
			return response.data;
		}
		return null;
	}catch(e){
		console.log(`[*] Account ${stt} | repairSpin err: ${e}`);
		return null;
	}
}
async function fullHpSpin(stt, userData, axios, spinnerId)
{
	try{
		const headers = {};

		const payload = {
			initData: userData,
			spinnerId: spinnerId
		};

		const response = await axios.post('https://back.timboo.pro/api/fullhp-activate', payload, { headers: headers });

		if (response && response.status == 200) {
			return response.data;
		}
		return null;
	}catch(e){
		console.log(`[*] Account ${stt} | fullHpSpin err: ${e}`);
		return null;
	}
}

async function checkTask(stt, userData, axios, idTask)
{
	try{
		const headers = {};

		const payload = {
			initData: userData,
			requirementId: idTask
		};

		const response = await axios.post('https://api.timboo.pro/check_requirement', payload, { headers: headers });

		if (response && response.status == 200) {
			return response.data;
		}
		return null;
	}catch(e){
		console.log(`[*] Account ${stt} | checkTask err: ${e}`);
		return null;
	}
}

async function openBox(stt, userData, axios, boxId)
{
	try{
		const headers = {};

		const payload = {
			boxId: boxId,
			initData: userData
		};

		const response = await axios.post('https://api.timboo.pro/open_box', payload, { headers: headers });

		if (response && response.status == 200) {
			return response.data;
		}
		return null;
	}catch(e){
		// console.log(`[*] Account ${stt} | openBox err: ${e}`);
		return null;
	}
}

async function upgradeSpin(stt, userData, axios, spinnerId)
{
	try{
		const headers = {};

		const payload = {
			spinnerId: spinnerId,
			initData: userData
		};

		const response = await axios.post('https://back.timboo.pro/api/upgrade-spinner', payload, { headers: headers });

		if (response && response.status == 200) {
			return true;
		}
		return false;
	}catch(e){
		// console.log(`[*] Account ${stt} | openBox err: ${e}`);
		return false;
	}
}

async function processSpin(stt, urlData, axios, spinners, mainSpinId){
	let spinData = spinners.find((spinner) => spinner.id === mainSpinId);
  if (spinData && spinData.hp > 0 && !spinData.isBroken) {
    let { hp, spinnerStats } = spinData;
    let { turbospin } = spinnerStats;
    console.log(cyan.bold(`[#] Account ${stt} | Spin HP: ${hp}`));
    if (hp >= 0) {
      let totalTaps = 0;
      while (totalTaps < hp) {
        let tap = (Math.floor(Math.random() * 6) + 5);
        totalTaps += tap*turbospin;

        let subTabs = await submitTaps(stt, urlData, axios, tap);
        if (subTabs) {
          console.log(
            green.bold(
              `[#] Account ${stt} | Spin: ${tap*turbospin}, HP Spin: ${Number(hp) - Number(totalTaps)}, Sleep: ${tap}`
            )
          );
          await sleep(tap);
        }

        if (totalTaps >= hp) {
          console.log(green.bold(`[#] Account ${stt} | Spin Done!`));
          break;
        }
      }
    }

    await sleep(5);
    let reInit = await initDataUser(stt, urlData, axios);
    let { spinners, user } = reInit.initData;
    let mainSpinId = user.mainSpinnerId;
    let respinData = spinners.find(
      (spinner) => spinner.id === mainSpinId && spinner.isBroken === true
    );
    if (respinData) {
      console.log(yellow.bold(`[#] Account ${stt} | Repair Spin!`));
      await sleep(5);
      let rp = await repairSpin(stt, urlData, axios);
      if (rp) {
        console.log(green.bold(`[#] Account ${stt} | Repair Spin Success!`));
      }
    }
  } else {
    let endRepair = spinData.endRepairTime;
    if (endRepair) {
      const utcPlus7Time = moment
        .utc(endRepair)
        .tz("Asia/Bangkok")
        .format("HH:mm:ss DD-MM-YYYY");
      console.log(
        yellow.bold(
          `[#] Account ${stt} | Repairs are being made. Completed at ${utcPlus7Time}!`
        )
      );
    }
  }
}
//
async function main(stt, account, axios) {
	try {
		let urlData = querystring.unescape(account).split('tgWebAppData=')[1].split('&tgWebAppVersion')[0];

		console.log(cyan.bold(`[#] Account ${stt} | Login...`));
		await sleep(5);
		let checkLogin = await login(stt, urlData, axios);
		if (checkLogin) {
			await sleep(5);
			let uData = await getUserData(stt, urlData, axios);
			if(uData){
				await sleep(5);
				let initData = await initDataUser(stt, urlData, axios);
				if(initData){
					let { levels, spinners, user, sections} = initData.initData;
					console.log(blue.bold(`[#] Account ${stt} | User: ${user.name}, Balance: ${user.balance}, League: ${user.league.name}`));
					let fullhpAmount = user.fullhpAmount;

					if(auto_farm){
						let mainSpinId = user.mainSpinnerId;
						await sleep(2);
						if(spinners){
							let processSpinners = await processSpin(stt, urlData, axios, spinners, mainSpinId);
						}else{
							console.log(yellow.bold(`[#] Account ${stt} | Spinners notfound!`));
						}

						if(fullhpAmount>0){
							console.log(yellow.bold(`[#] Account ${stt} | Boots Full HP: ${fullhpAmount}`));
							for(let i = 0; i < fullhpAmount; i++){
								await sleep(randomInt(2,5));
								let fullHp = await fullHpSpin(stt, urlData, axios, mainSpinId);
								if(fullHp){
									console.log(yellow.bold(`[#] Account ${stt} | Boots Full HP Success!`));
									let processSpinners2 = await processSpin(stt, urlData, axios, spinners, mainSpinId);
									await sleep(randomInt(5,8));
								}
							}
						}
					}

					if(auto_upgdate_spin){
						console.log(cyan.bold(`[#] Account ${stt} | Enable Auto Upgrade!`));
						let mainSpinId = user.mainSpinnerId;
						let spinData = spinners.find(spinner => spinner.id === mainSpinId);
						let spinLvCr = spinData.level;

						if(spinLvCr < 12 || !spinData.isMinted){
							let levelsPrice = levels.find(level => level.level === spinData.level)?.price;
							if(levelsPrice <= user.balance){
								console.log(yellow.bold(`[#] Account ${stt} | Upgrade Spin Id ${mainSpinId}...`));
								let upGrade = await upgradeSpin(stt, urlData, axios, mainSpinId);
								await sleep(randomInt(5, 10));
								if(upGrade){
									console.log(green.bold(`[#] Account ${stt} | Upgrade Spin Id ${mainSpinId} Success!!`));
								}else{
									console.log(yellow.bold(`[#] Account ${stt} | Upgrade Spin Id ${mainSpinId} Success!!`));
									let processSpinners3 = await processSpin(stt, urlData, axios, spinners, mainSpinId);
								}
							}else{
								console.log(yellow.bold(`[#] Account ${stt} | Has insufficient funds!`));
							}
						}else{
							console.log(yellow.bold(`[#] Account ${stt} | Spin Id ${mainSpinId} is max level: ${max_spin_level}!`));
						}
					}

					if(auto_claim_boxs){
						console.log(cyan.bold(`[#] Account ${stt} | Enable Open Box`));
						let boxes = uData.boxes;

						const boxesWithOpenTimeNull = boxes.filter(box => box.open_time == null || new Date(box.open_time).getTime() <= new Date().getTime());
						if(boxes.length > 0){
							boxesWithOpenTimeNull.map(async (box) => {
								console.log(cyan.bold(`[#] Account ${stt} | Claim box ${box.id} - ${box.name}...`));
								let claimed = await openBox(stt, urlData, axios, box.id);
								if(claimed){
									console.log(cyan.bold(`[#] Account ${stt} | Claim box ${box.name} Success: ${claimed?.reward_text}`));
								}
								await sleep(5);
							});
						}
					}

					if(auto_task){
						if(sections){
							const sectionSocial = sections.find(section => section.title === "Our social networks");
							let taskSocials =  sectionSocial ? sectionSocial.tasks : [];
							if(taskSocials.length > 0){
								const taskOk = taskSocials.find(task => task.name === "X (Twitter)");
								if(taskOk){
									taskOk.requirements.map(async (item) => {
										console.log(blue.bold(`[#] Account ${stt} | User: ${user?.name}, Claim task: ${item.description}`));
										let submitTask = await checkTask(stt, urlData, axios, item.id);
										await sleep(randomInt(4,6));
										if(submitTask){
											console.log(blue.bold(`[#] Account ${stt} | User: ${user?.name}, Claimed task: ${item.description} reward ${submitTask?.reward}`));
										}
									})
									// 
								}
							}

							//game
							const sectionGame = sections.find(section => section.title === "Game rewards");
							let taskGames =  sectionGame ? sectionGame.tasks : [];
							if(taskGames.length > 0){
								const taskGOK = taskGames.find(task => task.name === "Bronze League");
								if(taskGOK){
									taskGOK.requirements.map(async (item) => {
										console.log(blue.bold(`[#] Account ${stt} | User: ${user?.name}, Claim task: ${item.name}`));
										let submitTask = await checkTask(stt, urlData, axios, item.id);
										await sleep(randomInt(4,6));
										if(submitTask){
											console.log(blue.bold(`[#] Account ${stt} | User: ${user?.name}, Claimed task: ${item.name} reward ${submitTask?.reward}`));
										}
									})
									// 
								}
							}
						}
					}
				}
			}

			console.log(cyan.bold(`[#] Account ${stt} | Done!`));
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
		await countdown(timeRerun * 60);
	}
}
mainLoopMutil();
