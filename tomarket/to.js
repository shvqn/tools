const fs = require('fs');
const path = require('path');
const axios = require('axios');
const readline = require('readline');
const colors = require('colors');
const { parse } = require('querystring');
const { DateTime } = require('luxon');

class Tomarket {
    constructor() {
        this.headers = {
            'host': 'api-web.tomarket.ai',
            'connection': 'keep-alive',
            'accept': 'application/json, text/plain, */*',
            'user-agent': "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
            'content-type': 'application/json',
            'origin': 'https://mini-app.tomarket.ai',
            'x-requested-with': 'tw.nekomimi.nekogram',
            'sec-fetch-site': 'same-site',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'referer': 'https://mini-app.tomarket.ai/',
            'accept-language': 'en-US,en;q=0.9'
        };

        this.interval = 3;
        this.playGame = true;
        this.gameLowPoint = 300;
        this.gameHighPoint = 450;
    }

    setAuthorization(auth) {
        this.headers['authorization'] = auth;
    }

    delAuthorization() {
        delete this.headers['authorization'];
    }

    async login(data) {
        const url = 'https://api-web.tomarket.ai/tomarket-game/v1/user/login';
        const cleanedData = data.replace(/\r/g, '');
        const requestData = {
            init_data: cleanedData,
            invite_code: ''
        };
        
        this.delAuthorization();
        try {
            const res = await this.http(url, this.headers, JSON.stringify(requestData));
            if (res.status !== 200) {
                this.log(colors.red(`Login không thành công! Mã trạng thái: ${res.status}`));
                return null;
            }
            const token = res.data.data.access_token;
            this.log(colors.green(`Đăng nhập thành công!`));
            return token;
        } catch (error) {
            this.log(colors.red(`Lỗi trong quá trình đăng nhập: ${error.message}`));
            return null;
        }
    }
    

    async startFarming() {
        const data = JSON.stringify({ game_id: '53b22103-c7ff-413d-bc63-20f6fb806a07' });
        const url = 'https://api-web.tomarket.ai/tomarket-game/v1/farm/start';
        const res = await this.http(url, this.headers, data);
        if (res.status !== 200) {
            this.log(colors.red('Không thể bắt đầu farming!'));
            return false;
        }
        const endFarming = res.data.data.end_at;
        const formatEndFarming = DateTime.fromMillis(endFarming).toISO().split('.')[0];
        this.log(colors.green('Bắt đầu farming...'));
    }

    async endFarming() {
        const data = JSON.stringify({ game_id: '53b22103-c7ff-413d-bc63-20f6fb806a07' });
        const url = 'https://api-web.tomarket.ai/tomarket-game/v1/farm/claim';
        const res = await this.http(url, this.headers, data);
        if (res.status !== 200) {
            this.log(colors.red('Không thể thu hoạch cà chua!'));
            return false;
        }
        const poin = res.data.data.claim_this_time;
        this.log(colors.green('Đã thu hoạch cà chua'));
        this.log(colors.green('Phần thưởng : ') + colors.white(poin));
    }

    async dailyClaim() {
        const url = 'https://api-web.tomarket.ai/tomarket-game/v1/daily/claim';
        const data = JSON.stringify({ game_id: 'fa873d13-d831-4d6f-8aee-9cff7a1d0db1' });
        const res = await this.http(url, this.headers, data);
        if (res.status !== 200) {
            this.log(colors.red('Không thể điểm danh hàng ngày'));
            return false;
        }
        const poin = res.data.data.today_points;
        this.log(colors.green('Điểm danh hàng ngày thành công, phần thưởng: ') + colors.white(poin));
        return;
    }

    async playGameFunc(amountPass) {
        const dataGame = JSON.stringify({ game_id: '59bcd12e-04e2-404c-a172-311a0084587d' });
        const startUrl = 'https://api-web.tomarket.ai/tomarket-game/v1/game/play';
        const claimUrl = 'https://api-web.tomarket.ai/tomarket-game/v1/game/claim';
        for (let i = 0; i < amountPass; i++) {
            const res = await this.http(startUrl, this.headers, dataGame);
            if (res.status !== 200) {
                this.log(colors.red('Không thể bắt đầu trò chơi'));
                return;
            }
            this.log(colors.green('Bắt đầu chơi game...'));
            await this.countdown(30);
            const point = this.randomInt(this.gameLowPoint, this.gameHighPoint);
            const dataClaim = JSON.stringify({ game_id: '59bcd12e-04e2-404c-a172-311a0084587d', points: point });
            const resClaim = await this.http(claimUrl, this.headers, dataClaim);
            if (resClaim.status !== 200) {
                this.log(colors.red('Lỗi nhận cà chua trong trò chơi'));
                continue;
            }
            this.log(colors.green('Nhận được cà chua : ') + colors.white(point));
        }
    }

    async getBalance() {
        const url = 'https://api-web.tomarket.ai/tomarket-game/v1/user/balance';
        while (true) {
            const res = await this.http(url, this.headers, '');
            const data = res.data.data;
            if (!data) {
                this.log(colors.red('Lấy dữ liệu thất bại'));
                return null;
            }
            const timestamp = data.timestamp;
            const balance = data.available_balance;
            this.log(colors.green('Balance : ') + colors.white(balance));
            if (!data.daily) {
                await this.dailyClaim();
                continue;
            }
            const lastCheckTs = data.daily.last_check_ts;

            if (DateTime.now().toSeconds() > lastCheckTs + 24 * 60 * 60) {
                await this.dailyClaim();
                continue;
            }

            if (!data.farming) {
                this.log(colors.yellow('Farming chưa bắt đầu'));
                await this.startFarming();
                continue;
            }
            const endFarming = data.farming.end_at * 1000;
            const countdown = data.farming.end_at;
            const formatEndFarming = DateTime.fromMillis(endFarming).toISO().split('.')[0];
            if (timestamp * 1000 > endFarming) {
                await this.endFarming();
                continue;
            }
            this.log(colors.yellow('Thời gian hoàn thành farming : ') + colors.white(formatEndFarming));
            if (this.playGame) {
                const playPass = data.play_passes;
                this.log(colors.green('Vé trò chơi : ') + colors.white(playPass));
                if (parseInt(playPass) > 0) {
                    await this.playGameFunc(playPass);
                    continue;
                }
            }
            const next = countdown - timestamp;
            return next;
        }
    }

    loadData(file) {
        const datas = fs.readFileSync(file, 'utf8').split('\n');
        if (datas.length <= 0) {
            console.log(colors.red(`Không tìm thấy dữ liệu`));
            process.exit();
        }
        return datas;
    }

    save(id, token) {
        const tokens = JSON.parse(fs.readFileSync('token.json', 'utf8'));
        tokens[id] = token;
        fs.writeFileSync('token.json', JSON.stringify(tokens, null, 4));
    }

    get(id) {
        const tokens = JSON.parse(fs.readFileSync('token.json', 'utf8'));
        return tokens[id] || null;
    }

    isExpired(token) {
        const [header, payload, sign] = token.split('.');
        const decodedPayload = Buffer.from(payload, 'base64').toString();
        const parsedPayload = JSON.parse(decodedPayload);
        const now = Math.floor(DateTime.now().toSeconds());
        return now > parsedPayload.exp;
    }

    async http(url, headers, data = null) {
        while (true) {
            try {
                const now = DateTime.now().toISO().split('.')[0];
                let res;
                if (!data) {
                    res = await axios.get(url, { headers });
                } else if (data === '') {
                    res = await axios.post(url, null, { headers });
                } else {
                    res = await axios.post(url, data, { headers });
                }
                return res;
            } catch (error) {
                console.log(colors.red('Lỗi kết nối'));
                await this.countdown(1);
            }
        }
    }

    async countdown(t) {
        for (let i = t; i > 0; i--) {
            const hours = String(Math.floor(i / 3600)).padStart(2, '0');
            const minutes = String(Math.floor((i % 3600) / 60)).padStart(2, '0');
            const seconds = String(i % 60).padStart(2, '0');
            process.stdout.write(colors.white(`[*] Cần chờ ${hours}:${minutes}:${seconds}     \r`));
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        process.stdout.write('                                        \r');
    }

    log(msg) {
        console.log(`[*] ${msg}`);
    }

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    async main() {
        const args = require('yargs').argv;
        const dataFile = args.data || 'data.txt';
        const marinkitagawa = args.marinkitagawa || false;
        if (!marinkitagawa) {
            console.clear();
        }
        const datas = this.loadData(dataFile);
        while (true) {
            const listCountdown = [];
            const start = Math.floor(Date.now() / 1000);
            for (let i = 0; i < datas.length; i++) {
                const data = datas[i];
                const parser = parse(data);
                const user = JSON.parse(parser.user);
                const id = user.id;
                const username = user.first_name;
                console.log(`========== Tài khoản ${i + 1} | ${username.green} ==========`);

                let token = this.get(id);
                if (!token) {
                    token = await this.login(data);
                    if (!token) continue;
                    this.save(id, token);
                }
                if (this.isExpired(token)) {
                    token = await this.login(data);
                    if (!token) continue;
                    this.save(id, token);
                }
                this.setAuthorization(token);
                const result = await this.getBalance();
                await this.countdown(this.interval);
                listCountdown.push(result);
            }
            const end = Math.floor(Date.now() / 1000);
            const total = end - start;
            const min = Math.min(...listCountdown) - total;
            await this.countdown(min);
        }
    }
}

(async () => {
    try {
        const app = new Tomarket();
        await app.main();
    } catch (error) {
        console.error(error);
        process.exit();
    }
})();
