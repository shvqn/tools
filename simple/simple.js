const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { HttpsProxyAgent } = require('https-proxy-agent');

const queryFilePath = path.join(__dirname, 'query.txt');
const proxyFilePath = path.join(__dirname, 'proxy.txt');
const queryData = fs.readFileSync(queryFilePath, 'utf8').trim().split('\n');
const proxyData = fs.readFileSync(proxyFilePath, 'utf8').trim().split('\n');

async function countdown(time) {
    let now = new Date();
	let futureTime = new Date(now.getTime() + time * 1000);

    let hours = futureTime.getHours();
	let minutes = futureTime.getMinutes();
	let seconds = futureTime.getSeconds();
	
	hours = hours < 10 ? '0' + hours : hours;
	minutes = minutes < 10 ? '0' + minutes : minutes;
	seconds = seconds < 10 ? '0' + seconds : seconds;
	
	console.log(`Run next at: ${hours}:${minutes}:${seconds}`);
	await new Promise(resolve => setTimeout(resolve, time*1000));
}

const checkProxyIP = async (proxy) => {
    try {
        const proxyAgent = new HttpsProxyAgent(proxy);
        const response = await axios.get('https://api.ipify.org?format=json', {
            httpsAgent: proxyAgent
        });
        if (response.status === 200) {
            console.log('\nĐịa chỉ IP của proxy là:', response.data.ip);
        } else {
            console.error('Không thể kiểm tra IP của proxy. Status code:', response.status);
        }
    } catch (error) {
        console.error('Error khi kiểm tra IP của proxy:', error);
    }
};

function sleep() {
    // Tạo thời gian ngẫu nhiên từ 0 đến 5 giây (1000 đến 5000 mili giây)
    const randomMilliseconds = Math.floor(Math.random() * (5000 + 1)) + 1000;
    return new Promise(resolve => setTimeout(resolve, randomMilliseconds));
}

function formatTimeToUTC7(date) {
    // Tính giờ UTC+7 bằng cách cộng thêm 7 giờ vào thời gian hiện tại
    const utcOffset = 7; // UTC+7
    const utc7Date = new Date(date.getTime() + utcOffset * 60 * 60 * 1000);

    const hours = String(utc7Date.getUTCHours()).padStart(2, '0');
    const minutes = String(utc7Date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(utc7Date.getUTCSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}
function spinType(type) {
    switch (type){
        case "0":
            return "TAP LIMIT"
        case "1":
            return "COINS PER HOUR"
        case "2":
            return "TAP SIZE"
        case "3":
            return "COINS"
    }
}

const processQuery = async (query_id, proxy, stt) => {
    await checkProxyIP(proxy);
    query_id = query_id.replace(/[\r\n]+/g, '');
    const user_id_match = query_id.match(/user=%7B%22id%22%3A(\d+)/);
    if (!user_id_match) {
        console.error('Không thể tìm thấy user_id trong query_id');
        return;
    }
    const user_id = user_id_match[1];

    const payload = {
        "userId": user_id,
        "authData": query_id,
    };

    const agent = new HttpsProxyAgent(proxy);

    const profileConfig = {
        method: 'post',
        url: 'https://api.simple.app/api/v1/public/telegram/profile/',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
            'Origin': 'https://simpletap.app',
            'Referer': 'https://simpletap.app/',
            'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
            'Sec-Ch-Ua-Mobile': '?1',
            'Sec-Ch-Ua-Platform': '"Android"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
        },
        data: payload,
        httpsAgent: agent
    };

    const claimTaps = async (availableTaps, tapSize, balance, stt) => {
        const claimTapsPayload = {
            ...payload,
            "count": tapSize
        };

        const claimTapsConfig = {
            method: 'post',
            url: 'https://api.simple.app/api/v1/public/telegram/tap',
            headers: profileConfig.headers,
            data: claimTapsPayload,
            httpsAgent: agent
        };

        try {
            await axios(claimTapsConfig);
            console.log(`[#] Account ${stt} | AvailableTaps: ${availableTaps}, Balance: ${balance}`);
            if (availableTaps > 0) {
                sleep()
                await claimTaps(availableTaps - tapSize, tapSize, balance + tapSize, stt);
            }
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu claimTaps:', error);
        }
    };

    const claimFarm = async (stt, balance) => {
        const claimFarmPayload = {...payload}

        const claimFarmConfig = {
            method: 'post',
            url: 'https://api.simple.app/api/v1/public/telegram/claim/',
            headers: profileConfig.headers,
            data: claimFarmPayload,
            httpsAgent: agent
        };

        try {
            await axios(claimFarmConfig);
            console.log(`[#] Account ${stt} | Claim farm thành công, Balance: ${balance}`);
        } catch (error) {
            console.error(`[#] Account ${stt} | Lỗi khi gửi yêu cầu claimFarm: ${error}`);
        }
    };

    const startFarm = async (stt) => {
        const startFarmPayload = {...payload}

        const startFarmConfig = {
            method: 'post',
            url: 'https://api.simple.app/api/v1/public/telegram/activate/',
            headers: profileConfig.headers,
            data: startFarmPayload,
            httpsAgent: agent
        };

        try {
            await axios(startFarmConfig);
            console.log(`[#] Account ${stt} | Start farm thành công`);
        } catch (error) {
            console.error(`[#] Account ${stt} | Lỗi khi gửi yêu cầu startFarm:${error}`);
        }
    };

    const claimRef = async (stt, balanceRef) => {
        const claimRefPayload = {...payload}

        const claimRefConfig = {
            method: 'post',
            url: 'https://api.simple.app/api/v1/public/telegram/claim_friends/',
            headers: profileConfig.headers,
            data: claimRefPayload,
            httpsAgent: agent
        };

        try {
            await axios(claimRefConfig);
            console.log(`[#] Account ${stt} | Claim Ref thành công ${balanceRef} `);
        } catch (error) {
            console.error(`[#] Account ${stt} | Lỗi khi gửi yêu cầu claimRef: ${error}`);
        }
    };


    const spin = async (stt, spinCount) => {
        const spinPayload = {
            "amount": 0,
            ...payload
        };

        const spinConfig = {
            method: 'post',
            url: 'https://api.simple.app/api/v1/public/telegram/claim-spin/',
            headers: profileConfig.headers,
            data: spinPayload,
            httpsAgent: agent
        };

        try {
            const spinData = await axios(spinConfig);
            console.log(`[#] Account ${stt} | Spin thành công ${spinData.data.amount} ${spinType(spinData.data.spinType)}`);
            if (spinCount > 0) {
                spin(stt, spinCount - 1)
            }
        } catch (error) {
            console.error(`[#] Account ${stt} | Lỗi khi gửi yêu cầu spin: ${error}`);
        }
    };

    const getMiningBlocks = async (stt) => {
        const getMiningBlocksPayload = {...payload}

        const getMiningBlocksConfig = {
            method: 'post',
            url: 'https://api.simple.app/api/v1/public/telegram/get-mining-blocks/',
            headers: profileConfig.headers,
            data: getMiningBlocksPayload,
            httpsAgent: agent
        };

        try {
            const blockResponse = await axios(getMiningBlocksConfig);
            console.log(`[#] Account ${stt} | Lấy danh sách miningBlock thành công`);
            return blockResponse.data.data.mines
        } catch (error) {
            console.error(`[#] Account ${stt} | Lỗi khi gửi yêu cầu getMiningBlocks: ${error}`);
        }
    };

    const buyMiningBlock = async (stt, mineId, level) => {
        const buyMiningBlockPayload = {
            "authData" : query_id,
            "level" : level,
            "mineId": mineId,
            "userId": user_id
        }

        const buyMiningBlockConfig = {
            method: 'post',
            url: 'https://api.simple.app/api/v1/public/telegram/buy-mining-block/',
            headers: profileConfig.headers,
            data: buyMiningBlockPayload,
            httpsAgent: agent
        };

        try {
            await axios(buyMiningBlockConfig);
            console.log(`[#] Account ${stt} | Block ${mineId} update thành công lên lv ${level}`);
        } catch {
            const response = await axios(buyMiningBlockConfig)
            console.log(`[#] Account ${stt} | Lỗi update block ${mineId}: ${response.data.message}`);
        }
    };

    try {
        const response = await axios(profileConfig);
        const {balance, availableTaps, tapSize, spinCount, refBalance, activeFarmingSeconds} = response.data.data;
        console.log(`[#] Account ${stt} | Balance: ${balance}, AvailableTaps: ${availableTaps}, Spin: ${spinCount}, TapSize: ${tapSize}`);
        const now = new Date()
        const nowInMs = now.getTime()
        const farmStartedAtInMs = nowInMs - activeFarmingSeconds*1000
        const farmStartedAt = new Date(farmStartedAtInMs)
        const farmFinishAt = new Date(farmStartedAtInMs + 8*3600*1000)
        if (activeFarmingSeconds) {
            if (now >= farmFinishAt) {
                await claimFarm(stt, balance)
                await startFarm(stt)
            } else console.log(`[#] Account ${stt} | Có thể claim farm lúc ${formatTimeToUTC7(farmFinishAt)} `)
        } else await startFarm(stt)

        if (availableTaps > tapSize) {
            await claimTaps(availableTaps, tapSize, balance, stt);
        }
        if (refBalance > 0) {
            await claimRef(stt, refBalance)
        }
        if (spinCount > 0) {
            await spin(stt, spinCount)
        }

        const minesData = await getMiningBlocks(stt)
        for (const key in minesData) {
            const block = minesData[key]
            if (block.currentLevel < block.maxLevel && balance > block.nextPrice) {
                await buyMiningBlock(stt, block.mineId, block.currentLevel + 1 );
            }
        }

    } catch (error) {
        console.error('Lỗi khi gửi yêu cầu:', error.data);
    }
};

const run = async () => {
    while (true) {
        for (let i = 0; i < queryData.length; i++) {
            await processQuery(queryData[i], proxyData[i], i+1);
        }
        await countdown(8*3600)
    }
};

run();



