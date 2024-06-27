const axios = require('axios');
const querystring = require('querystring');

    const queries = [
        'query_id=AAHlCPFfAgAAAOUI8V8OFGXv&user=%7B%22id%22%3A5904599269%2C%22first_name%22%3A%22Qu%C3%A2n%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22Shvqn%22%2C%22language_code%22%3A%22vi%22%2C%22allows_write_to_pm%22%3Atrue%7D&auth_date=1718585691&hash=76f912ae766b77f63c9e8ed7f11652b4951895ee819246b48e0c31cd9129f5ac',
        'query_id=AAHDPYgpAwAAAMM9iCkQmfX9&user=%7B%22id%22%3A7139245507%2C%22first_name%22%3A%22Hehe%22%2C%22last_name%22%3A%22%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%7D&auth_date=1718587001&hash=25a9454866a9de428d394aa62cd7ded134f81955634110aa491930fa14409e4a',
        'query_id=AAH0H-IlAwAAAPQf4iVtO1uz&user=%7B%22id%22%3A7078027252%2C%22first_name%22%3A%22Peter%22%2C%22last_name%22%3A%22Lee%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%7D&auth_date=1718587414&hash=22ce89451c577d390ddc7550a3ae192219c2ec3fa10673a09a99c4e75751a6a4',
        'query_id=AAHyG0gGAwAAAPIbSAaxFp6V&user=%7B%22id%22%3A6547839986%2C%22first_name%22%3A%22Quan%22%2C%22last_name%22%3A%22Hoang%22%2C%22language_code%22%3A%22vi%22%2C%22allows_write_to_pm%22%3Atrue%7D&auth_date=1718588337&hash=555b0d3e7dec591df02996a9defdf8f31f73d50ed6c47c1d0e628828baccc69a']; // Thay QUERY_ID bằng query của bạn

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    while (true) {
        for (const query of queries) {
            await processQuery(query);
        }
        console.log('Đang nghỉ 4 giờ 5 phút trước khi lặp lại...');
        await sleep(14700 * 1000); 
    }
}

async function processQuery(query) {
    try {
        await sendRequest(query.trim());
        console.log('Đã hoàn thành nhiệm vụ được giao.');
    } catch (error) {
        console.error('Error processing query:', error);
    }
}

function sendRequest(payload) {
    const url = 'https://tg-bot-tap.laborx.io/api/v1/auth/validate-init';

    return axios.post(url, payload, {
        headers: {
            'Content-Type': 'text/plain;charset=UTF-8',
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
            'Origin': 'https://tg-tap-miniapp.laborx.io',
            'Referer': 'https://tg-tap-miniapp.laborx.io/',
            'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        }
    })
    .then(response => {
        const parsedPayload = querystring.parse(payload);

        const user = JSON.parse(decodeURIComponent(parsedPayload.user));
        const firstName = user.first_name;
        const lastName = user.last_name;

        const balance = response.data.balanceInfo.balance;
        const level = response.data.info.level;

        console.log(`======Tài khoản ${firstName} ${lastName}======`);
        console.log(`Balance: ${balance}`);
        console.log(`Level: ${level}`);

        const token = response.data.token;
        return getFarmingInfo(token);
    })
    .catch(error => {
        console.error(`Error for payload: ${payload}`);
        console.error(error);
    });
}

function getFarmingInfo(token) {
    const url = 'https://tg-bot-tap.laborx.io/api/v1/farming/info';

    return axios.get(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        }
    })
    .then(response => {
        const farmingInfo = response.data;
        const currentTime = new Date();
        const farmingEndTime = farmingInfo.activeFarmingStartedAt 
            ? new Date(new Date(farmingInfo.activeFarmingStartedAt).getTime() + farmingInfo.farmingDurationInSec * 1000) 
            : null;

        console.log(`Kiểm tra farming...`);

        if (!farmingInfo.activeFarmingStartedAt) {
            return startFarming(token);
        } else if (farmingEndTime && farmingEndTime < currentTime) {
            return finishFarming(token);
        }
    })
    .catch(error => {
        console.error('Không thể kiểm tra dữ liệu:');
        console.error(error);
    });
}

function startFarming(token) {
    const url = 'https://tg-bot-tap.laborx.io/api/v1/farming/start';

    return axios.post(url, {}, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        }
    })
    .then(response => {
        console.log('Bắt đầu farm...');
    })
    .catch(error => {
        console.error('Không thể bắt đầu farm');
        console.error(error);
    });
}

function finishFarming(token) {
    const url = 'https://tg-bot-tap.laborx.io/api/v1/farming/finish';

    return axios.post(url, {}, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        }
    })
    .then(response => {
        const balance = response.data.balance;
        console.log(`Claim thành công. Balance: ${balance}`);
        return startFarming(token);
    })
    .catch(error => {
        console.error('Không thể claim:');
        console.error(error);
    });
}


main();
