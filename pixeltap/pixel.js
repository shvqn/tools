import querystring from 'querystring';
import { countdown, randomInt, sleep, getData, getUserDataFromUrl } from './utils.js';
import { cyan, yellow, green, red } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";
import crypto from 'crypto';

const accounts = getData("data_pixel.txt");
const proxies = getData("proxy.txt");

let timeRerun = 8*60; //phút time nghỉ mỗi lượt chạy
let numberThread = 1; // số luồng chạy /1 lần 

let auto_claim = true;
let auto_daily_reward = true; 
let auto_task = true;
let auto_combo_daily = true;
//config pet
let auto_upgrade = true; //auto upgrade pet
let auto_buy = true; //auto buy pet 


function createAxiosInstance(proxy, headers = null) {
    const defaultHeaders = {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9',
        'priority': 'u=1, i',
        'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'Referer': 'https://sexyzbot.pxlvrs.io/',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
    
    const mergedHeaders = headers ? { ...defaultHeaders, ...headers } : defaultHeaders;

    return new AxiosHelpers({
        headers: mergedHeaders,
        proxy: proxy ? proxy : false,
    });
}
//end config

// main
async function getSecret(userid) {
    const key = 'adwawdasfajfklasjglrejnoierjboivrevioreboidwa';
    const message = userid.toString();
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(message);
    const secret = hmac.digest('hex');
    return secret;
}

async function getProgress(stt, axios) {
    const maxRetries = 3;
    let attempts = 0;

    while (attempts < maxRetries) {
        try {
            const response = await axios.get(`https://api-clicker.pixelverse.xyz/api/mining/progress`);

            if (response && response.status === 200) {
                const data = response.data;
                const current_available = data.currentlyAvailable;
                const min_amount = data.minAmountForClaim;
                const next_full = data.nextFullRestorationDate;
                return [current_available, min_amount, next_full];
            } else {
                attempts++;
                console.warn(`Attempt ${attempts} failed: Status code ${response.status}`);
            }
        } catch (e) {
            console.log(e);
            console.error(`[e] Account ${stt}: getProgress err: ${e}`);
            attempts++;
        }

        if (attempts >= maxRetries) {
            return [null, null, null];
        }
    }
}

async function claimMining(stt, axios) {
    try {
        const headers = {};
        const payload = {};

        const response = await axios.post('https://api-clicker.pixelverse.xyz/api/mining/claim', payload, { headers });
        const data = response.data;
        const claimed_amount = data.claimedAmount;

        if (claimed_amount) {
            return claimed_amount;
        } else {
            return null;
        }
    } catch (e) {
        console.log(`[e] Account ${stt}: claimMining err: ${e}`);
    }
}


async function getUserInfo(stt, axios) {
    try {
        const response = await axios.get('https://api-clicker.pixelverse.xyz/api/users');
        const data = response.data;
        const points = data.clicksCount;
        return data;
    } catch (e) {
        console.error(`[e] Account ${stt}: getUserInfo err: ${e}`);
        return null;
    }
}

async function checkRewardDaily(stt, axios) {
    try {
        const response = await axios.get('https://api-clicker.pixelverse.xyz/api/daily-rewards');
        const data = response.data;
        return data;
    } catch (e) {
        console.error(`[e] Account ${stt}: checkRewardDaily err: ${e}`);
        return null;
    }
}

async function getPetId(stt, axios) {
    try {
        const response = await axios.get(`https://api-clicker.pixelverse.xyz/api/pets`);
        const data = response.data;
        const petIds = data.data.filter(pet => pet.userPet.level < 19).map(pet => pet.userPet.id);
        const petMaxIds = data.data.filter(pet => pet.userPet.level === 19).map(pet => pet.userPet.id);
        return { petIds, petMaxIds };
    } catch (error) {
        console.error(`[e] Account ${stt}: getPetId err: ${e}`);
        return { petIds: [], petMaxIds: [] };
    }
}

async function getCost(stt, axios) {
    try {
        const response = await axios.get(`https://api-clicker.pixelverse.xyz/api/pets`);
        const data = response.data;
        return data.buyPrice;
    } catch (error) {
        console.error(`[e] Account ${stt}: getCost err: ${e}`);
        return { petIds: [], petMaxIds: [] };
    }
}

async function levelUpPet(stt, axios, pet_id) {
    try {
        const response = await axios.post(`https://api-clicker.pixelverse.xyz/api/pets/user-pets/${pet_id}/level-up`);
        const data = response.data;
        const level = data.level;
        const cost = data.levelUpPrice;
        if (level && cost) {
            return { level, cost };
        } else {
            return { level: null, cost: null };
        }
    } catch (error) {
        // console.log(error);
        console.error(`[e] Account ${stt}: levelUpPet err: ${error.message}`);
        return { level: null, cost: null };
    }
}
async function claimRewardToday(stt, axios) {
    try {
        const response = await axios.post(`https://api-clicker.pixelverse.xyz/api/daily-rewards/claim`);
        const data = response.data;
        return data;
    } catch (error) {
        console.error(`[e] Account ${stt}: claimRewardToday err: ${error.message}`);
        return null;
    }
}

async function buyPet(stt, axios, user_id) {
    try {
        const url = `https://api-clicker.pixelverse.xyz/api/pets/buy?tg-id=${user_id}&secret=adwawdasfajfklasjglrejnoierjboivrevioreboidwa`;
        const response = await axios.post(url, {});
        const data = response.data;
        if (data.pet) {
            return data.pet.name;
        } else {
            return data.message;
        }
    } catch (e) {
        console.error(`[e] Account ${stt}: buyPet err: ${e}`);
        return null;
    }
}

async function getTaskMe(stt, axios) {
    try {
        const response = await axios.get('https://api-clicker.pixelverse.xyz/api/tasks/my');
        const data = response.data;
        return data;
    } catch (e) {
        console.error(`[e] Account ${stt}: getTaskMe err: ${e}`);
        return null;
    }
}

async function startTask(stt, axios, taskId) {
    try {
        const urlTask = `https://api-clicker.pixelverse.xyz/api/tasks/start/${taskId}`;
        const response = await axios.post(urlTask);
        const data = response.data;
        return data;
    } catch (e) {
        console.error(`[e] Account ${stt}: startTask err: ${e}`);
        return null;
    }
}

async function checkTask(stt, axios, taskId) {
    try {
        const urlTask = `https://api-clicker.pixelverse.xyz/api/user-tasks/${taskId}/check`;

        const response = await axios.get(urlTask);
        if (response.status === 200) {
            return response.data;
        } 
    } catch (e) {
        if (e && e.response.status === 404) {
            console.log(`[e] Account ${stt}: ${e.response?.data?.message} (404)`);
            return null;
        }else if (e && e.response.status === 400) {
            console.log(`[e] Account ${stt}: ${e.response?.data?.message} (400)`);
            return null;
        } else {
            console.log(`[e] Account ${stt}: Unexpected response status: ${e.response.status}`);
            return null;
        }
        
    }
}

async function getPetInfo(stt, axios, petId) {
    try {
        const response = await axios.get('https://api-clicker.pixelverse.xyz/api/pets');
        const data = response.data;
        for (const pet of data.data) {
            if (pet.userPet && pet.userPet.id === petId) {
                return {
                    name: pet.name,
                    levelUpPrice: pet.userPet.levelUpPrice
                };
            }
        }
        return null;
    } catch (error) {
        console.log(`[e] Account ${stt}: getPetInfo: ${error}`);
        return null;
    }
}

async function claimDailyCombo(stt, axios) {
    try {
        const response = await axios.get('https://api-clicker.pixelverse.xyz/api/cypher-games/current');

        if (response.status !== 400) {
            const data = response.data;
            const comboId = data.id;
            const options = data.availableOptions;
            const shuffledOptions = options.sort(() => 0.5 - Math.random()).slice(0, 4);
            const jsonData = {};

            shuffledOptions.forEach((item, index) => {
                jsonData[item.id] = index;
            });
            const headers = {};

            const postResponse = await axios.post(`https://api-clicker.pixelverse.xyz/api/cypher-games/${comboId}/answer`, jsonData, {headers:headers});

            const postData = postResponse.data;
            const amount = postData.rewardAmount;
            return amount;
        } else {
            console.log(yellow.bold(`[e] Account ${stt}: Daily Combo Claim Before!`));
            return null;
        }
    } catch (error) {
        console.log(yellow.bold(`[e] Account ${stt}: Daily Combo Claim Before!`));
        return false;

    }
}

//
async function main(stt, account, proxy)
{
    try{
        let urlData = querystring.unescape(account).split('tgWebAppData=')[1].split('&tgWebAppVersion')[0];
        let userObject = getUserDataFromUrl(urlData);
        while(true){
        let access_secret = await getSecret(userObject.id);
        let tg_web = decodeURIComponent(urlData).split('&');
        let query_id = tg_web[0].split('=')[1]
        let user_data = tg_web[1].split('=')[1]
        let auth_date = tg_web[2].split('=')[1]
        let hash_value = tg_web[3].split('=')[1]

        const user_data_encoded = encodeURIComponent(user_data);
        const init_data = `query_id=${query_id}&user=${user_data_encoded}&auth_date=${auth_date}&hash=${hash_value}`;

        const headers = {
            "secret": `${access_secret}`,
            "initdata": `${init_data}`,
            "tg-id": `${userObject.id}`,
            "username": `${userObject.username}`
        }
        const axiosInstance = createAxiosInstance(proxy, headers);

        const {clicksCount: balance, username } = await getUserInfo(stt, axiosInstance);
        
        console.log(cyan.bold(`[+] Account ${stt} | Username: ${username}, Balance: ${parseInt(balance)}`));
        await sleep(randomInt(5,10));

        const [ current_available, min_amount] = await getProgress(stt, axiosInstance);
        await sleep(randomInt(5,10));
        if (auto_claim && current_available && min_amount && current_available > min_amount) {
            const amount = await claimMining(stt, axiosInstance);
            if (amount && amount != null) {
                await sleep(randomInt(5,10));
                const {clicksCount: balance, username } = await getUserInfo(stt, axiosInstance);
                console.log(cyan.bold(`[+] Account ${stt} | Username: ${username}, Claimed+: ${parseInt(amount)}, Balance: ${parseInt(balance)}`));
            } else {
                continue;
            }
        }

        if(auto_daily_reward){
            const { todaysRewardAvailable, day  } = await checkRewardDaily(stt, axiosInstance);
            if(todaysRewardAvailable && todaysRewardAvailable != null){
                await sleep(randomInt(5,10));
                const {amount} = await claimRewardToday(stt, axiosInstance);
                console.log(green.bold(`[+] Account ${stt} | Receive reward successfully. Claimed+: ${amount} Total days: ${day}`));
            }else{
                console.log(cyan.bold(`[+] Account ${stt} | Received daily reward. Total days: ${day}`));
            }
        }

        if(auto_task){
            await sleep(randomInt(5,10));
            const {available } = await getTaskMe(stt, axiosInstance);
            if(available.length > 0){
                console.log(cyan.bold(`[+] Account ${stt} | Task available: ${available.length}`));
                for(let i = 0; i < available.length; i++){
                    const task = available[i];
                    const typeTask = task.type;
                    if(typeTask != "TELEGRAM" && typeTask != "SNAPSHOT"){
                        const idTask = task.id;
                        await sleep(randomInt(5,10));
                        const taskResponse = await startTask(stt, axiosInstance, idTask);
                        if(taskResponse && taskResponse.status == "IN_PROGRESS"){
                            console.log(green.bold(`[+] Account ${stt} | Start task: ${task.type}`));
                            sleep(10);
                        }else{
                            console.log(red.bold(`[+] Account ${stt} | Start Fail task: ${task.type}`));
                        }
                    }
                }
            }
            await sleep(randomInt(5,10));
            const { inProgress } = await getTaskMe(stt, axiosInstance);
            if(inProgress.length > 0){
                console.log(cyan.bold(`[+] Account ${stt} | Task inprogress: ${inProgress.length}`));
                for(let i = 0; i < inProgress.length; i++){
                    const task = inProgress[i];
                    const typeTask = task.type;
                    if(typeTask != "TELEGRAM" && typeTask != "SNAPSHOT"){
                        const idTask = task.userTaskId;
                        if(task.status == "IN_PROGRESS"){
                            console.log(green.bold(`[+] Account ${stt} | Check task: ${task.type}`));
                            await sleep(randomInt(5,10));
                            const taskCheck = await checkTask(stt, axiosInstance, idTask);
                            if(taskCheck?.status == "DONE"){
                                console.log(green.bold(`[+] Account ${stt} | Task Completed: ${task.type}`));
                            }
                            sleep(2);
                        }else{
                            console.log(red.bold(`[+] Account ${stt} | Check Fail task: ${task.type}`));
                        }
                    }
                }
            }
        }

        if(auto_upgrade){
            await sleep(randomInt(5,10));
            const {petIds, petMaxIds} = await getPetId(stt, axiosInstance);
            if (petIds.length === 0 && petMaxIds.length === 0) {
                console.log(yellow.bold(`[+] Account ${stt} | No pets found!`));
            } else if (petIds.length === 0 && petMaxIds.length > 0) {
                console.log(yellow.bold(`[+] Account ${stt} | All pets have max level, can't upgrade!`));
            } else if(petIds.length > 0){
                for (const petId of petIds) {
                    await sleep(randomInt(3,5));
                    const petInfo = await getPetInfo(stt, axiosInstance, petId);
                    if (petInfo) {
                        const { name: petName, levelUpPrice: cost } = petInfo;
                        if (cost !== null) {
                            while (true) {
                                const {clicksCount: balance } = await getUserInfo(stt, axiosInstance);
                                if (parseInt(balance) >= parseInt(cost)) {
                                    const { level, cost: newCost } = await levelUpPet(stt, axiosInstance, petId);
                                    if (level !== null && newCost !== null) {
                                        console.log(green.bold(`[+] Account ${stt} | Successfully upgraded pet: ${petName}. Level now: ${level}, next level cost: ${newCost}`));
                                        await sleep(randomInt(3,5));
                                    }
                                } else {
                                    console.log(yellow.bold(`[+] Account ${stt} | Not enough money to upgrade ${petName}. Balance: ${parseInt(balance)}, level up pet cost: ${cost}`));
                                    break;
                                }
                            }
                        } else {
                            console.log(yellow.bold(`[+] Account ${stt} | Pet ID ${petId}: Account does not have enough money to upgrade!`));
                        }
                    }else{
                        console.log(yellow.bold(`[+] Account ${stt} | Unable to fetch info for pet ID ${petId}`));
                    }
                    await sleep(randomInt(5,6));
                }
            }
        }

        if(auto_buy){
            await sleep(randomInt(5,10));
            const {clicksCount: balance } = await getUserInfo(stt, axiosInstance);
            await sleep(randomInt(5,10));
            const new_pet_cost = await getCost(stt, axiosInstance);

            if (balance !== null && new_pet_cost !== null && parseInt(balance) >= parseInt(new_pet_cost)) {
                const petName = await buyPet(stt, axiosInstance, userObject.id);
                if (petName !== null && petName !== "You can buy only 1 pet in 24 hours") {
                    console.log(green.bold(`[+] Account ${stt} | Bought new pet, you got ${petName}`));
                } else {
                    console.log(yellow.bold(`[+] Account ${stt} |  Error buying: You can buy only 1 pet in 24 hours`));
                }
            }
        }

        if(auto_combo_daily){
            console.log(cyan.bold(`[+] Account ${stt} | Auto Combo Daily...`));
            const dailyComboStatus = await claimDailyCombo(stt, axiosInstance);
            if ((typeof dailyComboStatus === 'number') && (dailyComboStatus !== null)) {
                console.log(green.bold(`[+] Account ${stt} | Claimed daily combo: ${dailyComboStatus}`));
            }
        }

        console.log(cyan.bold(`[#] Account ${stt} | Done => Sleep 1 hour!`));
        break;
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
        if(countPrx >= 30){
            numberThread = 30;
        }if(countPrx > 0){
            numberThread = countPrx
        }
    }
    const accountChunks = createChunks(accounts, numberThread);

    for (const chunk of accountChunks) {
        let proxy = null;
        const tasks = chunk.map(async (account, index) => {
            const globalIndex = accounts.indexOf(account);

            // If proxies are available, assign one to the current account
            if (proxies.length > 0) {
                proxy = proxies[globalIndex % proxies.length];
            }

            if (account) {
                const axiosInstance = createAxiosInstance(proxy);
                const maskedProxy = proxy?.slice(0, -10) + '**********';
                console.log(`[#] Account: ${globalIndex + 1}, Proxy: ${maskedProxy}`);
                console.log(`[#] Account: ${globalIndex + 1} Check IP...`);
                let checkIp = await checkIP(axiosInstance);
                console.log(`[#] Account: ${globalIndex + 1} Run at IP: ${checkIp}`);
                await main(globalIndex + 1, account, proxy);
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
