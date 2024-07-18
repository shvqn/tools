const fs = require('fs');
const path = require('path');
const axios = require('axios');
const readline = require('readline');
const colors = require('colors');
const { parse } = require('querystring');
const { DateTime } = require('luxon');
const { HttpsProxyAgent } = require('https-proxy-agent');

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
        this.proxies = this.loadProxies('proxy.txt');
    }

    setAuthorization(auth) {
        this.headers['authorization'] = auth;
    }

    delAuthorization() {
        delete this.headers['authorization'];
    }

    loadProxies(file) {
        const proxies = fs.readFileSync(file, 'utf8').split('\n').map(line => line.trim()).filter(line => line.length > 0);
        if (proxies.length <= 0) {
            console.log(colors.red(`Không tìm thấy proxy`));
            process.exit();
        }
        return proxies;
    }

    async login(data, proxy) {
        const url = 'https://api-web.tomarket.ai/tomarket-game/v1/user/login';
        const cleanedData = data.replace(/\r/g, '');
        const requestData = {
            init_data: cleanedData,
            invite_code: ''
        };
        
        this.delAuthorization();
        try {
            const res = await this.http(url, this.headers, JSON.stringify(requestData), proxy);
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
    

    async startFarming(proxy) {
        const data = JSON.stringify({ game_id: '53b22103-c7ff-413d-bc63-20f6fb806a07' });
        const url = 'https://api-web.tomarket.ai/tomarket-game/v1/farm/start';
        const res = await this.http(url, this.headers, data, proxy);
        if (res.status !== 200) {
            this.log(colors.red('Không thể bắt đầu farming!'));
            return false;
        }
        const endFarming = res.data.data.end_at;
        const formatEndFarming = DateTime.fromMillis(endFarming).toISO().split('.')[0];
        this.log(colors.green('Bắt đầu farming...'));
    }

    async endFarming(proxy) {
        const data = JSON.stringify({ game_id: '53b22103-c7ff-413d-bc63-20f6fb806a07' });
        const url = 'https://api-web.tomarket.ai/tomarket-game/v1/farm/claim';
        const res = await this.http(url, this.headers, data, proxy);
        if (res.status !== 200) {
            this.log(colors.red('Không thể thu hoạch cà chua!'));
            return false;
        }
        const poin = res.data.data.claim_this_time;
        this.log(colors.green('Đã thu hoạch cà chua'));
        this.log(colors.green('Phần thưởng : ') + colors.white(poin));
    }

	async dailyClaim(proxy) {
		const url = 'https://api-web.tomarket.ai/tomarket-game/v1/daily/claim';
		const data = JSON.stringify({ game_id: 'fa873d13-d831-4d6f-8aee-9cff7a1d0db1' });
		const res = await this.http(url, this.headers, data, proxy);
		if (res.status !== 200) {
			this.log(colors.red('Không thể điểm danh hàng ngày!'));
			return false;
		}

		const responseData = res.data.data;
		if (typeof responseData === 'string') {
			return false;
		}

		const poin = responseData.today_points;
		this.log(colors.green('Điểm danh hàng ngày thành công, phần thưởng: ') + colors.white(poin));
		return true;
	}

    async playGameFunc(amountPass, proxy) {
        const dataGame = JSON.stringify({ game_id: '59bcd12e-04e2-404c-a172-311a0084587d' });
        const startUrl = 'https://api-web.tomarket.ai/tomarket-game/v1/game/play';
        const claimUrl = 'https://api-web.tomarket.ai/tomarket-game/v1/game/claim';
        for (let i = 0; i < amountPass; i++) {
            const res = await this.http(startUrl, this.headers, dataGame, proxy);
            if (res.status !== 200) {
                this.log(colors.red('Không thể bắt đầu trò chơi'));
                return;
            }
            this.log(colors.green('Bắt đầu chơi game...'));
            await this.countdown(30);
            const point = this.randomInt(this.gameLowPoint, this.gameHighPoint);
            const dataClaim = JSON.stringify({ game_id: '59bcd12e-04e2-404c-a172-311a0084587d', points: point });
            const resClaim = await this.http(claimUrl, this.headers, dataClaim, proxy);
            if (resClaim.status !== 200) {
                this.log(colors.red('Lỗi nhận cà chua trong trò chơi'));
                continue;
            }
            this.log(colors.green('Nhận được cà chua : ') + colors.white(point));
        }
    }

	async getBalance(proxy) {
		const url = 'https://api-web.tomarket.ai/tomarket-game/v1/user/balance';
		while (true) {
			const res = await this.http(url, this.headers, '', proxy);
			const data = res.data.data;
			if (!data) {
				this.log(colors.red('Lấy dữ liệu thất bại'));
				return null;
			}

			const timestamp = data.timestamp;
			const balance = data.available_balance;
			this.log(colors.green('Balance : ') + colors.white(balance));

			if (!data.daily) {
				await this.dailyClaim(proxy);
				continue;
			}

            const lastCheckTs = data.daily.last_check_ts;
            if (DateTime.now().toSeconds() > lastCheckTs + 24 * 60 * 60) {
				await this.dailyClaim(proxy);
			}

			if (!data.farming) {
				this.log(colors.yellow('Farming chưa bắt đầu'));
				await this.startFarming(proxy);
				continue;
			}

			const endFarming = data.farming.end_at;
			const formatEndFarming = DateTime.fromMillis(endFarming * 1000).toISO().split('.')[0];
			if (timestamp > endFarming) {
				await this.endFarming(proxy);
				continue;
			}

			this.log(colors.yellow('Thời gian hoàn thành farming: ') + colors.white(formatEndFarming));

			if (this.playGame) {
				const playPass = data.play_passes;
				this.log(colors.green('Vé trò chơi: ') + colors.white(playPass));
				if (parseInt(playPass) > 0) {
					await this.playGameFunc(playPass, proxy);
					continue;
				}
			}

			const next = endFarming - timestamp;
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

    async http(url, headers, data = null, proxy = null) {
        while (true) {
            try {
                const now = DateTime.now().toISO().split('.')[0];
                let res;
                if (!data) {
                    res = await axios.get(url, { headers, httpsAgent: new HttpsProxyAgent(proxy) });
                } else if (data === '') {
                    res = await axios.post(url, null, { headers, httpsAgent: new HttpsProxyAgent(proxy) });
                } else {
                    res = await axios.post(url, data, { headers, httpsAgent: new HttpsProxyAgent(proxy) });
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

    async checkProxyIP(proxy) {
        try {
            const proxyAgent = new HttpsProxyAgent(proxy);
            const response = await axios.get('https://api.ipify.org?format=json', {
                httpsAgent: proxyAgent
            });
            if (response.status === 200) {
                return response.data.ip;
            } else {
                throw new Error(`Không thể kiểm tra IP của proxy. Status code: ${response.status}`);
            }
        } catch (error) {
            throw new Error(`Error khi kiểm tra IP của proxy: ${error.message}`);
        }
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
                const proxy = this.proxies[i % this.proxies.length];
                let proxyIP = '';
                try {
                    proxyIP = await this.checkProxyIP(proxy);
                } catch (error) {
                    console.error('Lỗi khi kiểm tra IP của proxy:', error);
                }
                console.log(`========== Tài khoản ${i + 1} | ${username.green} | IP: ${proxyIP} ==========`);

                let token = this.get(id);
                if (!token) {
                    token = await this.login(data, proxy);
                    if (!token) continue;
                    this.save(id, token);
                }
                if (this.isExpired(token)) {
                    token = await this.login(data, proxy);
                    if (!token) continue;
                    this.save(id, token);
                }
                this.setAuthorization(token);
                const result = await this.getBalance(proxy);
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
