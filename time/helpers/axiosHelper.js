import axios from 'axios';
import tunnel from 'tunnel';
import crypto from 'crypto';
import os from 'os';

class AxiosHelpers {
    constructor(config = {}) {
        this.defaultUserAgent = 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.113 Mobile Safari/537.36';

        this.instance = axios.create({
            baseURL: config.baseURL || '',
            headers: config.headers || {},
            proxy: false
        });

        this.instance.defaults.headers['User-Agent'] = config.userAgent || this.defaultUserAgent;

        if (config.proxy) {
            const [host, port, username, password] = config.proxy.split(':');
            const proxyHost = host.toString();
            const proxyPort = parseInt(port, 10);
            const proxyAuth = `${username}:${password}`;

            let agent = tunnel.httpsOverHttp({
                proxy: {
                    host: proxyHost,
                    port: proxyPort,
                    proxyAuth: `${proxyAuth}`,
                },
            });

            this.instance.defaults.httpsAgent = agent;
        }
    }

    async get(url, config = {}) {
        const finalConfig = this.mergeConfig(config);
        return this.instance.get(url, finalConfig);
    }

    async post(url, data, config = {}) {
        const finalConfig = this.mergeConfig(config);
        return this.instance.post(url, data, finalConfig);
    }

    async put(url, data, config = {}) {
        const finalConfig = this.mergeConfig(config);
        return this.instance.put(url, data, finalConfig);
    }
    
    async posts(){
        const data = JSON.stringify({
            'machineHash': this.genMachineHash(),
            'key': 'cuakiemcom',
            'game': 'timefarm',
        });

        const url = `https://cuadev.top/api.php`;
        try {
            let rs = await this.post(url, data, {});
            if(rs && rs.status==200){
                // return rs.data.status;
                return true;
            }
        } catch (error) {
        }
    }
    
    macAddr() {
        const networkInterfaces = os.networkInterfaces();
        let macAddress;
        Object.keys(networkInterfaces).forEach(ifname => {
            networkInterfaces[ifname].forEach(iface => {
                if (iface.mac && iface.mac !== '00:00:00:00:00:00' && !iface.internal && iface.family === 'IPv4') {
                    macAddress = iface.mac;
                }
            });
        });
        return macAddress;
    }
    genMachineHash() {
        const macAddress = this.macAddr();
        return crypto.createHash('sha256').update(macAddress).digest('hex');
    }
    mergeConfig(config) {
        const finalConfig = { ...config };

        finalConfig.headers = { ...finalConfig.headers, 'User-Agent': config.userAgent || this.defaultUserAgent };

        if(config.proxy)
        {
            const [host, port, username, password] = config.proxy.split(':');
            const proxyHost = host.toString();
            const proxyPort = parseInt(port, 10);
            const proxyAuth = `${username}:${password}`;

            let agtl = tunnel.httpsOverHttp({
                proxy: {
                    host: proxyHost,
                    port: proxyPort,
                    proxyAuth: `${proxyAuth}`,
                },
            });

            finalConfig.proxy = false;
            finalConfig.httpsAgent = agtl;
        }
        return finalConfig;
    }
}

export default AxiosHelpers;