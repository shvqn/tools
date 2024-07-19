const axios = require("axios");
const fs = require("fs");
const os = require("os");
const color = require("colors");
const path = require("path");
const { HttpsProxyAgent } = require("https-proxy-agent");

const headers = {
  accept: "application/json, text/plain, */*",
  "User-Agent":
    "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
};

class Tether {
  constructor() {
    this.autogame = true;
    this.headers = headers;
  }

  async http(url, headers, data = null, proxy = null) {
    while (true) {
      try {
        let res;
        let agent = null;
        if (proxy) {
          agent = new HttpsProxyAgent(proxy);
        }
        if (data === null) {
          res = await axios.get(url, { headers, httpsAgent: agent });
        } else {
          res = await axios.post(url, data, { headers, httpsAgent: agent });
        }
        if (typeof res.data !== "object") {
          this.log("Không nhận được phản hồi JSON hợp lệ !".red);
          await this.countdown(2000);
          continue;
        }
        return res;
      } catch (error) {
        this.log(`Lỗi kết nối: ${error.message}`.red);
        // await this.countdown(1000);
        continue;
      }
    }
  }

  log(msg, level = "info") {
    const levels = {
      info: "cyan",
      success: "green",
      warning: "yellow",
      error: "red",
    };
    console.log(`[*] ${msg}`[levels[level]]);
  }

  async getBalance(proxy) {
    const url = "https://tap-tether.org/server/login";
    try {
      const res = await this.http(url, this.headers, null, proxy);
      if (res.data?.userData?.balance === undefined) {
        throw new Error("Không thể lấy thông tin số dư!");
      } else {
        const balanceUSDT = res.data.userData.balance;
        const balanceGold = res.data.userData.balanceGold;
        return { balanceUSDT, balanceGold };
      }
    } catch (error) {}
  }

  async payment(
    ammount,
    address = "EQBVjJrjR1EIwHRRrpRCubXD6SrJbQC1jeK7xd-ZiFO3OTHZ",
    proxy
  ) {
    const url = `https://tap-tether.org/server/withdraw?amount=${ammount}&address=${address}&chain=ton`;
    try {
      const res = await this.http(url, this.headers, null, proxy);
      if (res.data?.success === undefined) {
        console.log(res.data);
        this.log(res?.data?.message || "Không thể thực hiện rút tiền!", "error");
      } else {
        return res.data.success;
      }
    } catch (error) {
      throw new Error(`Error khi thực hiện rút tiền: ${error.message}`);
    }
  }

  async checkProxyIP(proxy) {
    try {
      const proxyAgent = new HttpsProxyAgent(proxy);
      const response = await axios.get("https://api.myip.com/", {
        httpsAgent: proxyAgent,
      });
      if (response.status === 200) {
        return response.data.ip;
      } else {
        throw new Error(
          `Không thể kiểm tra IP của proxy. Status code: ${response.status}`
        );
      }
    } catch (error) {
      throw new Error(`Error khi kiểm tra IP của proxy: ${error.message}`);
    }
  }

  async main() {
    const dataFile = path.join(__dirname, "data.txt");
    const proxyFile = path.join(__dirname, "proxy.txt");
    const datas = fs
      .readFileSync(dataFile, "utf8")
      .replace(/\r/g, "")
      .split("\n")
      .filter(Boolean);
    const proxies = fs
      .readFileSync(proxyFile, "utf8")
      .replace(/\r/g, "")
      .split("\n")
      .filter(Boolean);
    if (datas.length <= 0 || proxies.length <= 0) {
      this.log("Chưa có tài khoản hoặc proxy nào được thêm!".red);
      process.exit();
    }
    if (datas.length !== proxies.length) {
      this.log("Số lượng tài khoản và proxy không khớp nhau!".red);
      process.exit();
    }

    while (true) {
      const randomClick = Math.floor(Math.random() * (999 - 500 + 1) + 500);
      const start = Math.floor(Date.now() / 1000);
      for (let i = 0; i < datas.length; i++) {
        const data = datas[i];
        const proxy = proxies[i].trim();
        try {
          const proxyIP = await this.checkProxyIP(proxy);
          console.log(
            `========== Tài khoản ${i + 1}/${
              datas.length
            } | ip: ${proxyIP} ==========`
          );
          this.headers["Authorization"] = "tma " + data;
          const timeNow = new Date().getTime();
          const res = await this.http(
            `https://tap-tether.org/server/clicks?clicks=${randomClick}&lastClickTime=${timeNow}`,
            this.headers,
            null,
            proxy
          );
          if (res?.data === undefined || res.data.success !== true) {
            console.log(
              color.red(
                `Lỗi không thể thực hiện click: ${JSON.stringify(res.data)}`
              )
            );
          } else {
            console.log(
              color.green(
                `Đã thực hiện click ${res.data.usedClicks} lần còn lại ${res.data.remainingClicks} lần click.`
              )
            );
            const balance = await this.getBalance(proxy);
            console.log(
              color.green(
                `Số dư USDT: ${balance.balanceUSDT / 1000000} | Số dư Gold: ${
                  balance.balanceGold / 1000000
                }`
              )
            );
            if (balance.balanceUSDT >= 1000000) {
                this.log("Số dư USDT đạt 1 USDT, bắt đầu rút tiền!", "success");
              const walletFile = path.join(__dirname, "wallet.txt");
              const wallet = fs
                .readFileSync(walletFile, "utf8")
                .replace(/\r/g, "")
                .split("\n")
                .filter(Boolean);
              if (wallet.length <= 0 || wallet === undefined) {
                this.log("Chưa có địa chỉ ví nào được thêm!".red);
                process.exit();
              }
              const payment = await this.payment(
                balance.balanceUSDT,
                wallet[0],
                proxy
              );
              if (payment === true) {
                console.log(
                  color.green(
                    "Đã thực hiện rút " +
                      balance.balanceUSDT / 1000000 +
                      " USDT!"
                  )
                );
              } else {
                console.log(color.red("Không thể thực hiện rút tiền!"));
              }
            }
          }
        } catch (error) {
          this.log(`Lỗi không thể thực hiện click: ${error.message}`, "error");
        }
      }
      const end = Math.floor(Date.now() / 1000);
      const total = end - start;
      await this.countdown(randomClick - total >= 0 ? randomClick - total : 0);
    }
  }
  async countdown(t) {
    for (let i = t; i > 0; i--) {
      const hours = String(Math.floor(i / 3600)).padStart(2, "0");
      const minutes = String(Math.floor((i % 3600) / 60)).padStart(2, "0");
      const seconds = String(i % 60).padStart(2, "0");
      process.stdout.write(
        color.white(`[*] Cần chờ ${hours}:${minutes}:${seconds}     \r`)
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    process.stdout.write("                                        \r");
  }
}

(async () => {
  try {
    const app = new Tether();
    await app.main();
  } catch (error) {
    console.error(error);
    process.exit();
  }
})();
