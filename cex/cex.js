const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { HttpsProxyAgent } = require('https-proxy-agent');

const queryFilePath = path.join(__dirname, 'query.txt');
const proxyFilePath = path.join(__dirname, 'proxy.txt');
const queryData = fs.readFileSync(queryFilePath, 'utf8').trim().split('\n');
const proxyData = fs.readFileSync(proxyFilePath, 'utf8').trim().split('\n');

const animatedLoading = (durationInMilliseconds) => {
    const frames = ["|", "/", "-", "\\"];
    const endTime = Date.now() + durationInMilliseconds;
    return new Promise(resolve => {
        const interval = setInterval(() => {
            const remainingTime = Math.floor((endTime - Date.now()) / 1000);
            const frame = frames[Math.floor(Date.now() / 250) % frames.length];
            process.stdout.write(`\rChờ đợi lần yêu cầu tiếp theo ${frame} - Còn lại ${Math.floor(remainingTime / 3600)} giờ ${Math.floor((remainingTime%3600)/60)} phút ${(remainingTime%3600)%60} giây...`);
            if (Date.now() >= endTime) {
                clearInterval(interval);
                process.stdout.write("\rĐang chờ yêu cầu tiếp theo được hoàn thành.\n");
                resolve();
            }
        }, 250);
    });
};

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

const processQuery = async (query_id, proxy) => {
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

    const claimTaps = async (availableTaps) => {
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
            console.log('Đang claim taps....');
            console.log('Balance:', balance);
            if (availableTaps > 0) {
                await claimTaps(availableTaps);
            }
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu claimTaps:', error);
        }
    };

    const claimFarm = async () => {
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
            console.log('Đang claim farm....');
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu claimFarm:', error);
        }
    };

    const startFarm = async () => {
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
            console.log('Đang khởi động farm....');
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu startFarm:', error);
        }
    };

    try {
        const response = await axios(config);
        const { first_name, last_name, balance, availableTaps, farmReward, farmStartedAt, lastSeenAt } = response.data.data;
        console.log(`====================${first_name} ${last_name}====================`);
        console.log('[ Balance ]:', balance);
        console.log('[ Available Taps ]:', availableTaps);
        console.log('[ Farm Reward ]:', farmReward);

        if (farmStartedAt && lastSeenAt) {
            const farmStartedTime = new Date(farmStartedAt);
            const lastSeenTime = new Date(lastSeenAt);
            const timeDifference = Math.abs(lastSeenTime - farmStartedTime) / 36e5;

            if (timeDifference > 4) {
                await claimFarm();
                await startFarm();
            }
        } else {
            await startFarm();
        }

        if (availableTaps > 0) {
            await claimTaps(availableTaps);
        }
    } catch (error) {
        console.error('Lỗi khi gửi yêu cầu:', error);
    }
};

const run = async () => {
    while (true) {
        for (let i = 0; i < queryData.length; i++) {
            await processQuery(queryData[i], proxyData[i]);
        }
        await animatedLoading(4 * 60 * 60 * 1000);  
    }
};

run();



