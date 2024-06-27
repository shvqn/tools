import querystring from "querystring";
import {
  countdown,
  randomInt,
  getConfig,
  contentId,
  sleep,
  getData,
  convertSecondsToHMS,
} from "./utils.js";
import { cyan, yellow, blue, green, magenta } from "console-log-colors";
import AxiosHelpers from "./helpers/axiosHelper.js";

// Config
const accounts = getData("at.txt");
const proxies = getData("proxy.txt");

let timeRerun = 480; // minutes
let numberThread = 100; // threads per run

let auto_farm = true; // auto farm
let auto_claim_ref = true; // auto claim referral reward
let auto_task = true; // auto task

function createAxiosInstance(proxy) {
  return new AxiosHelpers({
    headers: {
      accept: "*/*",
      "accept-language":
        "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
      "cache-control": "no-cache",
      origin: "https://bot-coin.arenavs.com",
      pragma: "no-cache",
      priority: "u=1, i",
      referer: "https://bot-coin.arenavs.com/",
      "sec-ch-ua":
        '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": '"Android"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
    },
    proxy: proxy ? proxy : false,
  });
}

// Main functions

async function getFarmInfo(
  stt,
  user_id,
  axios,
  retryDelay = 5000,
  maxRetries = 5
) {
  let retries = 0;
  const headers = {
    at: user_id,
  };

  const payload = {};

  while (retries < maxRetries) {
    try {
      const response = await axios.get("https://bot.arenavs.com/v1/profile", {
        headers: headers,
      });

      if (response && response.status === 200) {
        return response.data;
      } else if (response && response.status === 304) {
        console.log(
          `[i] Account ${stt} | getFarmInfo response 304: Not Modified. Retrying...`
        );
        retries++;
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        console.log(
          `[e] Account ${stt} | getFarmInfo unexpected response status: ${response.status}`
        );
        break;
      }
    } catch (e) {
      console.log(`[e] Account ${stt} | getFarmInfo err: ${e}`);
      break;
    }
  }

  console.log(
    `[e] Account ${stt} | getFarmInfo failed after ${retries} retries`
  );
  return null;
}

async function getFarmFinish(stt, token, axios) {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const payload = {};

    const response = await axios.post(
      "https://bot-coin.arenavs.com/api/v1/farming/finish",
      payload,
      { headers: headers }
    );

    if (response && response.status == 200) {
      return response.data;
    }
  } catch (e) {
    console.log(`[e] Account ${stt} | getFarmFinish err: ${e}`);
  }
}

async function getFarmStart(stt, user_id, axios) {
  try {
    const headers = {
      at: user_id,
    };

    const payload = {};

    const response = await axios.post(
      "https://bot.arenavs.com/v1/profile/farm-coin",
      payload,
      { headers: headers }
    );

    if (response && response.status == 201) {
      return response.data;
    }
  } catch (e) {
    console.log(`[e] Account ${stt} | getFarmStart đã claim: ${e}`);
  }
}

async function getBalanceInfo(stt, user_id, axios) {
  try {
    const headers = {
      at: user_id,
    };

    const payload = {};

    const response = await axios.get("https://bot.arenavs.com/v1/profile", {
      headers: headers,
    });

    if (response && response.status == 200) {
      return response.data;
    }
  } catch (e) {
    console.log(`[e] Account ${stt} | getBalanceInfo err: ${e}`);
  }
}

async function getClaimRef(stt, user_id, axios) {
  try {
    const headers = {
      at: user_id,
    };

    const payload = {};

    const response = await axios.post(
      "https://bot.arenavs.com/v1/profile/get-ref-coin",
      payload,
      { headers: headers }
    );

    if (response && response.status == 200) {
      return response.data;
    }
  } catch (e) {
    console.log(`[e] Account ${stt} | getClaimRef err: ${e}`);
  }
}

async function getTaskInfo(stt, user_id, axios) {
  try {
    const headers = {
      at: user_id,
    };

    const payload = {};

    const response = await axios.get(
      "https://bot.arenavs.com/v1/profile/tasks?page=1&limit=20",
      { headers: headers }
    );

    if (response && response.status == 200) {
      return response.data.data.docs;
    }
  } catch (e) {
    console.log(`[e] Account ${stt} | getTaskInfo err: ${e}`);
  }
}

async function submitTask(stt, user_id, axios, idTask) {
  try {
    const headers = {
      at: user_id,
    };

    const payload = {};
    const response = await axios.post(
      `https://bot.arenavs.com/v1/profile/tasks/${idTask}`,
      payload,
      { headers: headers }
    );

    if (response && response.status == 201) {
      return response.data;
    }
  } catch (e) {
    console.log(`[e] Account ${stt} | submitTask err: ${e}`);
  }
}

async function claimTask(stt, token, axios, idTask) {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const payload = {};

    let response = await axios.post(
      `https://bot.arenavs.com/v1/profile/tasks/${idTask}/claim`,
      payload,
      { headers: headers }
    );

    if (response && response.status == 200) {
      if (response.data == "OK") {
        response = await axios.get(
          `https://bot.arenavs.com/v1/profile/tasks/${idTask}`,
          { headers: headers }
        );
        if (response && response.status == 200) {
          return response.data;
        }
      }
    }
  } catch (e) {
    console.log(`[e] Account ${stt} | claimTask err: ${e}`);
  }
}

async function main(stt, account, axios) {
  try {
    let parsedUrl = new URL(account);
    let fragment = parsedUrl.hash ? parsedUrl.hash.substring(1) : "";
    const queryParams = querystring.parse(fragment);
    const tgWebAppData = queryParams.tgWebAppData || "";
    const dataParams = querystring.parse(tgWebAppData);
    const user_data_encoded = dataParams.user || "";
    const user_data_json = JSON.parse(user_data_encoded);
    const user_id = String(user_data_json.id);

    console.log(cyan.bold(`[#] Account ${stt} | Login...`));
    await sleep(5);
    if (user_id) {
      console.log(cyan.bold(`[#] Account ${stt} | Get Farm Info...`));
      await sleep(5);
      if (auto_farm) {
        let farmInfo = await getFarmInfo(stt, user_id, axios);
        
        if (farmInfo) {
          console.log(cyan.bold(`[#] Account ${stt} | Start Claim ...`));
          let firtClaim = await getFarmStart(stt, user_id, axios);
          if (firtClaim) {
            console.log(green.bold(`[#] Account ${stt} | Start Farm Success`));
          } else {
            console.log(green.bold(`[#] Account ${stt} | Đang Farmming`));
          }
        }
      }

      console.log(cyan.bold(`[#] Account ${stt} | Get Balance...`));
      await sleep(5);
      let balanceInfo = await getBalanceInfo(stt, user_id, axios);
      if (
        balanceInfo.data.balance &&
        balanceInfo.data.balance["$numberDecimal"]
      ) {
        const balanceNumberDecimal = balanceInfo.data.balance["$numberDecimal"];
        console.log(
          yellow.bold(`[*] Account ${stt} | Balance: ${balanceNumberDecimal}`)
        );
      } else {
        console.log(
          "Không tìm thấy giá trị balance hoặc $numberDecimal trong data."
        );
      }

      console.log(cyan.bold(`[#] Account ${stt} | Get ref...`));
      if (auto_claim_ref) {
        let claimRef = await getClaimRef(stt, user_id, axios);
        if (claimRef) {
          console.log(cyan.bold(`[#] Account ${stt} | Claim Referral Friend!`));
          await sleep(2);
        }
      }

      if (auto_task) {
        console.log(yellow.bold(`[#] Account ${stt} | Open Auto Task!`));
        let subDone1 = false;
        await sleep(2);

        let getTask = await getTaskInfo(stt, user_id, axios);
        if (getTask) {
          const taskIncom = getTask.filter((item) => item.status === "pending");
          if (taskIncom.length > 0) {
            console.log(
              cyan.bold(`[#] Account ${stt} | Start ${taskIncom.length} Task!`)
            );
            for (let i = 0; i < taskIncom.length; i++) {
              let idTask = taskIncom[i]._id;
              let nameTask = taskIncom[i].title;
              let sourceTask = taskIncom[i].source;
              console.log(
                blue.bold(
                  `[#] Account ${stt} | Start task: ${nameTask} - Reward ${sourceTask}`
                )
              );
              sleep(2);
              let checkT = await submitTask(stt, user_id, axios, idTask);
              if (checkT.status == "ok") {
                console.log(
                  magenta.bold(
                    `[#] Account ${stt} | Submit task: ${nameTask} - Reward ${sourceTask} - Pending..`
                  )
                );
                if (idTask != "Join Telegram") {
                  subDone1 = true;
                }
              }

              sleep(5);
            }
          }
        }

        if (subDone1) {
          console.log(
            yellow.bold(`[#] Account ${stt} | Sleep 65s To completed task..`)
          );
          await sleep(65);
        }

        let getTask2 = await getTaskInfo(stt, user_id, axios);
        if (getTask2) {
          const taskCheck = getTask2.filter(
            (item) => item.status === "completed"
          );
          if (taskCheck.length > 0) {
            console.log(
              cyan.bold(`[#] Account ${stt} | Start ${taskCheck.length} Task!`)
            );
            for (let i = 0; i < taskCheck.length; i++) {
              let idTask = taskCheck[i]._id;
              let nameTask = taskCheck[i].title;
              let sourceTask = taskCheck[i].source;
              console.log(
                magenta.bold(
                  `[#] Account ${stt} | Check task: ${nameTask} - Reward ${sourceTask}`
                )
              );
              sleep(randomInt(5, 10));
              let claimT = await claimTask(stt, user_id, axios, idTask);
              if (claimT) {
                console.log(
                  green.bold(
                    `[#] Account ${stt} | Claimed task: ${nameTask} - Reward ${claimT.reward} - DONE`
                  )
                );
              }
              sleep(5);
            }
          }
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
}

// Run multithreading
async function runMulti() {
  const createChunks = (array, size) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };
  let countPrx = proxies.length;
  if (numberThread > countPrx) {
    if (countPrx >= 30) {
      numberThread = 30;
    } else {
      numberThread = countPrx;
    }
  }
  const accountChunks = createChunks(accounts, numberThread);

  for (const chunk of accountChunks) {
    let proxy = null;
    const tasks = chunk.map(async (account, index) => {
      const globalIndex = accounts.indexOf(account);

      if (proxies.length > 0) {
        proxy = proxies[globalIndex % proxies.length];
      }

      if (account) {
        const axiosInstance = createAxiosInstance(proxy);
        let stt = Number(globalIndex) + Number(1);
        const maskedProxy = proxy?.slice(0, -10) + "**********";
        console.log(`[#] Account ${stt} | Proxy: ${maskedProxy}`);
        console.log(`[#] Account ${stt} | Check IP...`);
        let checkIp = await checkIP(axiosInstance);
        console.log(`[#] Account ${stt} | Run at IP: ${checkIp}`);
        await main(stt, account, axiosInstance);
      }
    });
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
