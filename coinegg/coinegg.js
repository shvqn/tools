const axios = require('axios');
const fs = require('fs');

function getData(filename)
{
    return fs.readFileSync(filename, "utf8").toString().split(/\r?\n/).filter((line) => line.trim() !== "");
}
const accounts = getData("data_coinegg.txt");
let timeRerun = 10; //phút time nghỉ mỗi lượt chạy
let numberThread = 3; // số luồng chạy /1 lần

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

async function runMulti() {
	const createChunks = (array, size) => {
        const result = [];
        for (let i = 0; i < array.length; i += size) {
                result.push(array.slice(i, i + size));
        }
        return result;
	};
	const accountChunks = createChunks(accounts, numberThread);

	for (const chunk of accountChunks) {
		const tasks = chunk.map(async (account) => {
			const globalIndex = accounts.indexOf(account);
            if (account) {
                let stt = Number(globalIndex) + Number(1);
                // await main(stt, account, axiosInstance);
                let TOKEN = "";
                const DATA = JSON.stringify({
                    "token": TOKEN,
                    "egg_uid": '',
                    "init_data": account,
                    "referrer": ""
                });
                let NAME = ""
                const HEADER = {
                    'accept': 'application/json, text/plain, */*',
                    'accept-language': 'vi;q=0.8',
                    'content-type': 'application/json',
                    'origin': 'https://app-coop.rovex.io',
                    'priority': 'u=1, i',
                    'referer': 'https://app-coop.rovex.io/',
                    'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Brave";v="126"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'cross-site',
                    'sec-gpc': '1',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
                }
                const CONFIG = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: '',
                    headers: HEADER,
                    data: DATA
                };
                
                async function getToken() {
                    CONFIG.url = 'https://egg-api.hivehubs.app/api/login/tg';
                    try {
                        const response = await axios.request(CONFIG);
                        const rsObject = response.data;
                        TOKEN = rsObject.data.token.token;
                        NAME = rsObject.data.user.display_name;
                        await getAssets();
                    } catch (error) {
                        console.log("Lỗi Token!!!", error);
                        throw error;
                    }
                }
                
                async function getAssets() {
                    const updatedData = JSON.stringify({
                        "token": TOKEN
                    });
                    const updatedConfig = {
                        ...CONFIG,
                        url: 'https://egg-api.hivehubs.app/api/user/assets',
                        data: updatedData
                    };
                    axios.request(updatedConfig)
                    .then((response) => {
                        const diamond = response.data.data['diamond'] ? response.data.data['diamond'].amount : 0;
                        const egg = response.data.data['egg'] ? response.data.data['egg'].amount : 0;
                        const usdt = response.data.data['usdt'] ? response.data.data['usdt'].amount : 0;
                        console.log(`[#] Account ${stt} | ${NAME} Balance: ${diamond} 💎, ${egg} 🥚, ${usdt} 💲`)
                    })
                    .catch((error) => {
                        console.log("Lỗi getAsset. Bỏ qua"+error);
                    });
                }
                function collect(eggsID) {
                    const updatedData = JSON.stringify({
                        "token": TOKEN,
                        "egg_uid": eggsID
                    });
                    const updatedConfig = {
                        ...CONFIG,
                        url: 'https://egg-api.hivehubs.app/api/scene/egg/reward',
                        data: updatedData
                    };
                    DATA.egg_uid = eggsID;
                    axios.request(updatedConfig)
                        .then((response) => {
                            const type = response.data['data'].a_type;
                            if (type) {
                                let icon = (type ==='egg') ? "🥚" : (type ==='diamond') ? "💎" : "💲"
                                console.log(`[#] Account ${stt} | Đã nhặt ${response.data['data'].amount} ${icon}`);
                            }
                        })
                        .catch((error) => {
                            console.log("Lỗi khi nhặt trứng. Bỏ qua"+error);
                        });
                
                }
                async function getEggs() {
                    const updatedData = JSON.stringify({
                        "token": TOKEN
                    });
                    const updatedConfig = {
                        ...CONFIG,
                        data: updatedData,
                        url: 'https://egg-api.hivehubs.app/api/scene/info'
                    };
                    axios.request(updatedConfig)
                        .then((response) => {
                            let parsedData =  JSON.parse(JSON.stringify(response.data));
                            parsedData.data.forEach((element, index, array)  => {
                                element.eggs.forEach((egg, eggIndex, eggArray) =>{
                                    var eggObjects = JSON.parse(JSON.stringify(egg))
                                    collect(eggObjects.uid,(index === array.length - 1 && eggIndex === eggArray.length - 1))
                                })
                            });
                        })
                        .catch((error) => {
                            if (error.message.includes('token')){
                                startCollecting();
                            }
                        });
                }
                async function startCollecting() {
                    try {
                        await getToken();
                        await getEggs();
                    } catch (error) {
                        console.error('Có lỗi khi khởi động!!!', error);
                    }
                }
                
                startCollecting();

            }
        })
	console.log(`Số luồng chạy: ${tasks.length} ...`);
	await Promise.all(tasks);
    }
}
async function mainLoopMutil() {
	while (true) {
		await runMulti();
		await countdown(timeRerun * 60);
	}
}
mainLoopMutil();










