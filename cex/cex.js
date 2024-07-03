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

function formatTimeToUTC7(date) {
    const utcOffset = 7; // UTC+7
    const utc7Date = new Date(date.getTime() + utcOffset * 60 * 60 * 1000);

    const hours = String(utc7Date.getUTCHours()).padStart(2, '0');
    const minutes = String(utc7Date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(utc7Date.getUTCSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

const processQuery = async (stt, query_id, proxy) => {
    await checkProxyIP(proxy);
    query_id = query_id.replace(/[\r\n]+/g, '');
    const user_id_match = query_id.match(/user=%7B%22id%22%3A(\d+)/);
    if (!user_id_match) {
        console.error('Không thể tìm thấy user_id trong query_id');
        return;
    }
    const user_id = user_id_match[1];

    const payload = {
        "devAuthData": user_id,
        "authData": query_id,
        "platform": "android",
        "data": {}
    };

    const agent = new HttpsProxyAgent(proxy);

    const config = {
        method: 'post',
        url: 'https://cexp.cex.io/api/getUserInfo',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
            'Origin': 'https://cexp.cex.io',
            'Referer': 'https://cexp.cex.io/',
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

    const claimTaps = async (stt, availableTaps) => {
        const claimTapsPayload = {
            "devAuthData": user_id,
            "authData": query_id,
            "data": { "taps": availableTaps }
        };

        const claimTapsConfig = {
            method: 'post',
            url: 'https://cexp.cex.io/api/claimTaps',
            headers: config.headers,
            data: claimTapsPayload,
            httpsAgent: agent
        };

        try {
            const claimResponse = await axios(claimTapsConfig);
            const { balance, availableTaps } = claimResponse.data.data;
            console.log(`[#] Account ${stt} | Đang claim taps....`);
            console.log(`[#] Account ${stt} | Balance: ${balance}`);
            if (availableTaps > 0) {
                await claimTaps(availableTaps);
            }
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu claimTaps:', error);
        }
    };

    const claimFarm = async (stt) => {
        const claimFarmPayload = {
            "devAuthData": user_id,
            "authData": query_id,
            "data": {}
        };

        const claimFarmConfig = {
            method: 'post',
            url: 'https://cexp.cex.io/api/claimFarm',
            headers: config.headers,
            data: claimFarmPayload,
            httpsAgent: agent
        };

        try {
            await axios(claimFarmConfig);
            console.log(`[#] Account ${stt} | Đang claim farm....`);
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu claimFarm:', error);
        }
    };

    const startFarm = async (stt) => {
        const startFarmPayload = {
            "devAuthData": user_id,
            "authData": query_id,
            "data": {}
        };

        const startFarmConfig = {
            method: 'post',
            url: 'https://cexp.cex.io/api/startFarm',
            headers: config.headers,
            data: startFarmPayload,
            httpsAgent: agent
        };

        try {
            await axios(startFarmConfig);
            console.log(`[#] Account ${stt} | Đang khởi động farm....`);
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu startFarm:', error);
        }
    };

    const startTask = async (stt, id) => {
        const startFarmPayload = {
            "devAuthData": user_id,
            "authData": query_id,
            "data": {
                "taskId": id,
            }
        };

        const startFarmConfig = {
            method: 'post',
            url: 'https://cexp.cex.io/api/startTask',
            headers: config.headers,
            data: startFarmPayload,
            httpsAgent: agent
        };

        try {
            await axios(startFarmConfig);
            console.log(`[#] Account ${stt} | Đang start task...`);
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu starttask:', error);
        }
    };

    const checkTask = async (stt, id) => {
        const startFarmPayload = {
            "devAuthData": user_id,
            "authData": query_id,
            "data": {
                "taskId": id,
            }
        };

        const startFarmConfig = {
            method: 'post',
            url: 'https://cexp.cex.io/api/checkTask',
            headers: config.headers,
            data: startFarmPayload,
            httpsAgent: agent
        };

        try {
            await axios(startFarmConfig);
            console.log(`[#] Account ${stt} | Đang check task...`);
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu checktask:', error);
        }
    };

    const claimTask = async (stt, id) => {
        const startFarmPayload = {
            "devAuthData": user_id,
            "authData": query_id,
            "data": {
                "taskId": id,
            }
        };

        const startFarmConfig = {
            method: 'post',
            url: 'https://cexp.cex.io/api/claimTask',
            headers: config.headers,
            data: startFarmPayload,
            httpsAgent: agent
        };

        try {
            await axios(startFarmConfig);
            console.log(`[#] Account ${stt} | Đang claim task...`);
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu claimtask:', error);
        }
    };

    const getRef = async () => {
        const startFarmPayload = {
            "devAuthData": user_id,
            "authData": query_id,
            "data": {}
        };

        const startFarmConfig = {
            method: 'post',
            url: 'https://cexp.cex.io/api/getChildren',
            headers: config.headers,
            data: startFarmPayload,
            httpsAgent: agent
        };

        try {
            const response = await axios(startFarmConfig);
            if (response && response.status == 200) {
                return response.data.data.totalRewardsToClaim
            } else return 0
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu getRef:', error);
        }
    };

    const claimRef = async (stt) => {
        const startFarmPayload = {
            "devAuthData": user_id,
            "authData": query_id,
            "data": {}
        };

        const startFarmConfig = {
            method: 'post',
            url: 'https://cexp.cex.io/api/claimFromChildren',
            headers: config.headers,
            data: startFarmPayload,
            httpsAgent: agent
        };

        try {
            const response = await axios(startFarmConfig);
            if (response && response.status == 200) {
                console.log(`[#] Account ${stt} | Claim ref thành công `)
            }
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu claimRef:', error);
        }
    };

    try {
        const response = await axios(config);
        const { first_name, last_name, balance, availableTaps, farmStartedAt, tasks} = response.data.data;
        console.log(`[#] Account ${stt} | ${first_name} ${last_name}, Balance: ${balance}, Available Taps: ${availableTaps} `);

        const now = new Date()
        const farmFinishAt = new Date(new Date(farmStartedAt).getTime() + 4*3600*1000)
        if (farmFinishAt && now >= farmFinishAt) {
                await claimFarm(stt);
                await startFarm(stt);
        } else {
            console.log(`[#] Account ${stt} | Có thể claim lúc ${formatTimeToUTC7(farmFinishAt)}`)
        }

        if (availableTaps > 0) {
            await claimTaps(stt, availableTaps);
        }

        const availableTasks = Object.keys(tasks)
            .filter(key => tasks[key].type !== "referral")
            .filter(key => tasks[key].state !== "Claimed")
            .filter(key => key !== "register_on_cex_io")
            .reduce((obj, key) => {
                obj[key] = tasks[key];
                return obj;
            }, {});
        
        const refBalance = await getRef()
        if (refBalance) {
            await claimRef(stt)
        }

        for (const key in availableTasks) {
            if (availableTasks[key].state == "NONE"){
                await startTask(stt, key)
            }
            if (availableTasks[key].state == "ReadyToCheck") {
                await checkTask(stt, key)
            } 
            if (availableTasks[key].state == "ReadyToClaim"){
                await claimTask(stt, key)
            }
        }
    } catch (error) {
        console.error('Lỗi khi gửi yêu cầu:', error);
    }
};

const run = async () => {
    while (true) {
        for (let i = 0; i < queryData.length; i++) {
            await processQuery(i+1, queryData[i], proxyData[i]);
        }
        await countdown(4*3600 + 5*60)
    }
};

run();



