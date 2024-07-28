import { randomInt, sleep, getData, getObject } from './utils.js';
import { cyan, yellow, blue, green } from 'console-log-colors';
import AxiosHelpers from "./helpers/axiosHelper.js";

const accounts = getObject("data.json");
const proxies = getData("proxy.txt");

let numberThread = 1; // số luồng chạy /1 lần 
// 

function createAxiosInstance(proxy) {
	return new AxiosHelpers({
		headers: {
			"accept": "*/*",
			"accept-language": "vi,vi-VN;q=0.9,fr-FR;q=0.8,fr;q=0.7,en;q=0.6",
			"content-type": "application/json",
			"priority": "u=1, i",
			Origin: "https://app.ongame.dev",
			Referer: "https://app.ongame.dev/",
			author: "https://t.me/nauquu",
			"sec-ch-ua": "\"Google Chrome\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"",
			"sec-ch-ua-mobile": "?0",
			"sec-ch-ua-platform": "\"Windows\"",
			"sec-fetch-dest": "empty",
			"sec-fetch-mode": "cors",
			"sec-fetch-site": "same-site",
			"Referrer-Policy": "strict-origin-when-cross-origin"
		},
		proxy: proxy ? proxy : false,
	});
}
//end config
// main

async function getToken(stt, account, axios)
{
	try{
		const headers = {}
		const payload = {
			password: account.pass,
			username: account.user
		}
		const response = await axios.post(`https://back.ongame.dev/auth/login`, payload, {headers});
		if (response && response.status == 200) {
			return response.data.token;
		}
	}catch(e){
		console.log(`[*] Account ${stt} | getToken err: ${e}`);
	}
}
async function getTable(stt, axios, token)
{
	try{
		const headers = {
			Authorization: `Bearer ${token}`
		}
		const payload = {}
		const response = await axios.post(`https://back.ongame.dev/data/tables`, payload, {headers});
		if (response && response.status == 201) {
			console.log(green.bold(`[Nauquu] Account ${stt} | Get table`));
		}
	}catch(e){
		console.log(`[*] Account ${stt} | getTable err: ${e}`);
	}
}
async function getStats(stt, axios, token)
{
	try{
		const headers = {
			Authorization: `Bearer ${token}`
		}
		const payload = {}
		const response = await axios.post(`https://back.ongame.dev/character/stats`, payload, {headers});
		if (response && response.status == 201) {
			console.log(green.bold(`[Nauquu] Account ${stt} | Get stats`));
		}
	}catch(e){
		console.log(`[*] Account ${stt} | getStats err: ${e}`);
	}
}
async function getBalance(stt, axios, token)
{
	try{
		const headers = {
			Authorization: `Bearer ${token}`
		}
		const payload = {}
		const response = await axios.post(`https://back.ongame.dev/character/balance`, payload, {headers});
		if (response && response.status == 201) {
			console.log(green.bold(`[Nauquu] Account ${stt} | Get balance`));
		}
	}catch(e){
		console.log(`[*] Account ${stt} | getBalance err: ${e}`);
	}
}
async function getPlayerState(stt, axios, token)
{
	try{
		const headers = {
			Authorization: `Bearer ${token}`
		}
		const payload = {}
		const response = await axios.post(`https://back.ongame.dev/character/player-state`, payload, {headers});
		if (response && response.status == 201) {
			console.log(green.bold(`[Nauquu] Account ${stt} | Get player state`));
		}
	}catch(e){
		console.log(`[*] Account ${stt} | getPlayerState err: ${e}`);
	}
}
async function getItems(stt, axios, token)
{
	try{
		const headers = {
			Authorization: `Bearer ${token}`
		}
		const payload = {}
		const response = await axios.get(`https://back.ongame.dev/store/items`, {headers});
		if (response && response.status == 200) {
			console.log(green.bold(`[Nauquu] Account ${stt} | Get items`));
		}
	}catch(e){
		console.log(`[*] Account ${stt} | getItems err: ${e}`);
	}
}
async function getRating(stt, axios, token)
{
	try{
		const headers = {
			Authorization: `Bearer ${token}`
		}
		const response = await axios.get(`https://back.ongame.dev/game/rating`, {headers});
		if (response && response.status == 200) {
			console.log(green.bold(`[Nauquu] Account ${stt} | Get rating`));
		}
	}catch(e){
		console.log(`[*] Account ${stt} | getRating err: ${e}`);
	}
}
async function getBoosts(stt, axios, token)
{
	try{
		const headers = {
			Authorization: `Bearer ${token}`
		}
		const payload = {}
		const response = await axios.get(`https://back.ongame.dev/character/boosts`, {headers});
		if (response && response.status == 201) {
			console.log(green.bold(`[Nauquu] Account ${stt} | Get player state`));
		}
	}catch(e){
		console.log(`[*] Account ${stt} | getBoosts err: ${e}`);
	}
}
async function getVip(stt, axios, token)
{
	try{
		const headers = {
			Authorization: `Bearer ${token}`
		}
		const payload = {}
		const response = await axios.get(`https://back.ongame.dev/player/vip`, {headers});
		if (response && response.status == 201) {
			console.log(green.bold(`[Nauquu] Account ${stt} | Get vip`));
		}
	}catch(e){
		console.log(`[*] Account ${stt} | getVip err: ${e}`);
	}
}
async function getDatas(stt, axios, token, id)
{
	try{
		const headers = {
			Authorization: `Bearer ${token}`
		}
		const response = await axios.get(`https://back.ongame.dev/world/locations/data?id=${id}`, {headers});
		if (response && response.status == 200) {
			console.log(green.bold(`[Nauquu] Account ${stt} | Get data ${id}`));
		}
	}catch(e){
		console.log(`[*] Account ${stt} | getData err: ${e}`);
	}
}
async function battle(stt, token, axios)
{
	try{
		const headers = {
			Authorization: `Bearer ${token}`
		}
		const payload = {
			level: 0,
			"location_id": 7,
		}
		const response = await axios.post(`https://back.ongame.dev/battle`, payload, {headers});
		if (response && response.status == 201) {
			console.log(blue.bold(`[Nauquu] Account ${stt} | Play game, GameID: ${response.data.data.game_id}`));
			return response.data
		}
	}catch(e){
		if (e.response.data.data.game_id){
			return await joinBattle(stt, axios, token,e.response.data.data.game_id)
		} else console.log(`[Nauquu] Account ${stt} | battle err: ${e}`);
	}
}
async function getActors(stt, axios, token, id)
{
	try{
		const headers = {
			Authorization: `Bearer ${token}`
		}
		const payload = {
			"game_id": id 
		}
		const response = await axios.post(`https://back.ongame.dev/battle/actors`,payload, {headers});
		if (response && response.status == 201) {
			console.log(green.bold(`[Nauquu] Account ${stt} | Get actors`));
		}
	}catch(e){
		console.log(`[*] Account ${stt} | getActor err: ${e}`);
	}
}
async function swapGem(stt, token, axios, id, x1, y1, x2, y2)
{
	try{
		const headers = {
			Authorization: `Bearer ${token}`
		}
		const payload = {
			"game_id": id,
			"x1": x1,
			"x2": x2,
			"y1": y1,
			"y2": y2
		}
		const response = await axios.post(`https://back.ongame.dev/battle/swap`, payload, {headers});
		if (response && response.status == 201) {
			console.log(cyan.bold(`[Nauquu] Account ${stt} | Swap`));
			return response.data;
		}
	}catch(e){
		console.log(`[*] Account ${stt} | swap err: ${e}`);
	}
}
async function ultimate(stt, token, axios, id)
{
	try{
		const headers = {
			Authorization: `Bearer ${token}`
		}
		const payload = {
			"game_id": id,
		}
		const response = await axios.post(`https://back.ongame.dev/battle/ultimate`, payload, {headers});
		if (response && response.status == 201) {
			console.log(blue.bold(`[Nauquu] Account ${stt} | Ultimate`));
		}
	}catch(e){
		console.log(`[*] Account ${stt} | ultimate err: ${e}`);
	}
}
async function joinBattle(stt, axios, token, id)
{
	try{
		const headers = {
			Authorization: `Bearer ${token}`
		}
		const payload = {
			"game_id": id 
		}
		const response = await axios.post(`https://back.ongame.dev/battle/join`, payload, {headers});
		if (response && response.status == 201) {
			console.log(blue.bold(`[Nauquu] Account ${stt} | Join game, GameID: ${id}`));
			return response.data;
		}
	}catch(e){
		console.log(`[*] Account ${stt} | joinBattle err: ${e}`);
	}
}
async function gameResult(stt, axios, token, id)
{
	try{
		const headers = {
			Authorization: `Bearer ${token}`
		}
		const payload = {
			"game_id": id 
		}
		const response = await axios.post(`https://back.ongame.dev/battle/result`, payload, {headers});
		if (response && response.status == 201) {
			if (response.data.victory)
			console.log(green.bold(`[Nauquu] Account ${stt} | Victory`));
			console.log(green.bold(`[Nauquu] Account ${stt} | Claimed ${response.data.rewards.amount} ${response.data.rewards.client_id}`));
		} else console.log(green.bold(`[Nauquu] Account ${stt} | Defeat`));
	}catch(e){
		console.log(`[*] Account ${stt} | gameResult err: ${e}`);
	}
}
const createBoard = (data) => {
	const boardSize = Math.sqrt(data.length);
	let board = [];
	for (let i = 0; i < boardSize; i++) {
		board.push(data.slice(i * boardSize, (i + 1) * boardSize));
	}
	return board
}
const findValidMoves = (board) => {
	const size = board.length;
	for (let i = 0; i < size; i++) {
	  for (let j = 0; j < size; j++) {
		// Kiểm tra hoán đổi  bên phải
		if (j < size - 1 && isValidMove(board, i, j, i, j + 1))
		  return [j, i, j+1, i];
		// Kiểm tra hoán đổi bên trên
		if (i < size - 1 && isValidMove(board, i, j, i + 1, j))
		  return [j, i, j, i+1];
	  }
	}
	return null;
};
const checkBoard = (board) => {
	const size = board.length;
	for (let i = 0; i < size; i++) {
	  for (let j = 0; j < size; j++) {
		const value = board[i][j];
		// Kiểm tra hàng dọc
		if (j <= size - 3 && value === board[i][j + 1] && value === board[i][j + 2]) return true;
		// Kiểm tra hàng ngang
		if (i <= size - 3 && value === board[i + 1][j] && value === board[i + 2][j]) return true;
	  }
	}
	return false;
};
const swap = (board, x1, y1, x2, y2) => {
	const temp = board[x1][y1];
	board[x1][y1] = board[x2][y2];
	board[x2][y2] = temp;
  };
const isValidMove = (board, x1, y1, x2, y2) => {
	swap(board, x1, y1, x2, y2); // Hoán đổi thử
	const valid = checkBoard(board); // Kiểm tra tính hợp lệ
	swap(board, x1, y1, x2, y2); // Hoán đổi lại để trả về trạng thái ban đầu
	return valid;
};
const updateBoard = (board, eventLog) => {
	eventLog.forEach(event => {
		if (event.gems) {
			event.gems.forEach(gem => {
				board[gem.y][gem.x] = gem.value;
			});
		}
	});
	return board;
};
async function playGame(stt, token, axios, boardData, gameId)
{
	let board = createBoard(boardData);
	let move = findValidMoves(board)
	while (move) {
		const [x1, y1, x2, y2] = move
		// console.log(move);//////////////////////////////////
		const updateBoardData = await swapGem(stt, token, axios, gameId, x1, y1, x2, y2)
		const eventLog = updateBoardData.event_log
		const userArmor = updateBoardData.player_1_armor
		const bossArmor = updateBoardData.player_2_armor
		const userHealth = updateBoardData.player_1_health
		const bossHealth = updateBoardData.player_2_health
		const userUltra = updateBoardData.player_1_ultra
		const bossUltra = updateBoardData.player_2_ultra
		if (!userHealth || !bossHealth) {
			await gameResult(stt, axios, token, gameId)
			break;
		}
		updateBoard(board, eventLog)
		// console.log(board);//////////////////////////////////////
		console.log(yellow.bold(`[Nauquu] Account ${stt} | User: HP: ${userHealth}, Armor: ${userArmor}, Ultimate: ${userUltra}`));
		console.log(yellow.bold(`[Nauquu] Account ${stt} | Boss: HP: ${bossHealth}, Armor: ${bossArmor}, Ultimate: ${bossUltra}`));
		if (userUltra > 4) {
			await ultimate(stt, token, axios, gameId)
		}
		move = findValidMoves(board)
		await sleep(1);
	  }
}
async function upgrade(stt, axios, token)
{
	try{
		const headers = {
			Authorization: `Bearer ${token}`
		}
		const payload = {}
		const response = await axios.post(`https://back.ongame.dev/character/skills/request`, payload, {headers});
		if (response && response.status == 201) {
			console.log(blue.bold(`[Nauquu] Account ${stt} | Upgrade success`));
		}
	}catch(e){
		console.log(`[Nauquu] Account ${stt} | Upgrade failed`);
	}
}
//
async function main(stt, account, axios) {
	try {
		//red blue yellow green violet
		console.log(cyan.bold(`[Nauquu] Account ${stt} | Login...`));
		const token = await getToken(stt, account, axios)
		if (token) {
			await getTable(stt, axios, token)
			await getStats(stt, axios, token)
			await getBalance(stt, axios, token)
			await getPlayerState(stt, axios, token)
			await getItems(stt, axios, token)
			await getRating(stt, axios, token)
			await getBoosts(stt, axios, token)
			await getVip(stt, axios, token)
			for (let i = 3; i<7; i++) {
				await getDatas(stt, axios, token, i.toString())
			}
			await upgrade(stt, axios, token)
		}
		while (token) {
			const battleData = await battle(stt, token,axios)
			const {game_id, board} = battleData
			await getActors(stt, axios, token, game_id)
			await playGame(stt, token, axios, board, game_id)
			await sleep(5)
		}
		
		console.log(cyan.bold(`[Nauquu] Account ${stt} | Done!`));

	} catch (e) {
		console.log(`Main Err: ${e}`);
	}
}

// end main

async function runMulti() {
	const createChunks = (array, size) => {
			const result = [];
			for (let i = 0; i < array.length; i += size) {
					result.push(array.slice(i, i + size));
			}
			return result;
	};
	let countPrx = proxies.length;
	if(numberThread > countPrx) {
			if(countPrx >=30){
					numberThread = 30;
			}else if(countPrx > 0){
					numberThread = countPrx
			}
	}
	const accountChunks = createChunks(accounts, numberThread);

	for (const chunk of accountChunks) {
			let proxy = null;
			const tasks = chunk.map(async (account) => {
					const globalIndex = accounts.indexOf(account);

					if (proxies.length > 0) {
							proxy = proxies[globalIndex % proxies.length];
					}

		if (account) {
			const axiosInstance = createAxiosInstance(proxy);
			let stt = Number(globalIndex) + Number(1);
			let checkIp = await checkIP(axiosInstance);
			console.log(`[Nauquu] Account ${stt} | IP: ${checkIp}`);
			await main(stt, account, axiosInstance);
		}
	})
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
		// await countdown(timeRerun * 60);
	}
}
mainLoopMutil();
