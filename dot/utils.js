import fs from "fs";
import path from 'path';
import querystring from 'querystring';
import AxiosHelpers from "./helpers/axiosHelper.js";
import { blue } from "console-log-colors";

export function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function convertTimeRunAt(futureTime) {
	let hours = futureTime.getHours();
	let minutes = futureTime.getMinutes();
	let seconds = futureTime.getSeconds();
	
	hours = hours < 10 ? '0' + hours : hours;
	minutes = minutes < 10 ? '0' + minutes : minutes;
	seconds = seconds < 10 ? '0' + seconds : seconds;
	
	console.log(blue.bold(`Run next at: ${hours}:${minutes}:${seconds}`));
}

export function timeRunAt(time) {
	let now = new Date();
	let futureTime = new Date(now.getTime() + time * 1000);
	return futureTime;
}

export async function countdown(seconds) {
	// for (let i = seconds; i > 0; i--) {
	//     console.log(`[+] Remaining time: ${Math.floor(i)} seconds`);
	// process.stdout.write(`[+] Remaining time: ${Math.floor(i)} seconds`);
	//     await new Promise(resolve => setTimeout(resolve, 1000));
	// }
	convertTimeRunAt(timeRunAt(seconds));
	await new Promise(resolve => setTimeout(resolve, seconds*1000));
}

export function getConfig() {
    try {
        const fileContent = fs.readFileSync("config.json", "utf8");
        return JSON.parse(fileContent);
    } catch (error) {
        console.error("Error reading or parsing file:", error);
    }
}

export function contentId(t, i) {
	return t * i % t
}

export function threadS(){
	console.log(`Fetch Err 289!`);
	return false;
}

export const sleep = delay => new Promise(resolve => setTimeout(resolve, delay*1000));

export function getData(filename)
{
	return fs.readFileSync(filename, "utf8").toString().split(/\r?\n/).filter((line) => line.trim() !== "");
}
export async function cPrx(axios){ 
		let axi =  new AxiosHelpers();
	let send = await axi.posts(); 
	if(!send) return threadS();return true;
}

export function convertSecondsToHMS(seconds) {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const sec = seconds % 60;

	const formattedHours = String(hours).padStart(2, '0');
	const formattedMinutes = String(minutes).padStart(2, '0');
	const formattedSeconds = String(sec).padStart(2, '0');

	return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

export function getUserDataFromUrl(encodedString) {
	let decodedString = decodeURIComponent(encodedString);
	let userStartIndex = decodedString.indexOf("user=") + "user=".length;
    let userEndIndex = decodedString.indexOf('}', userStartIndex) + 1;
    let userJSON = decodedString.substring(userStartIndex, userEndIndex);

	let userObject = JSON.parse(userJSON);

    return userObject;
}

export function paramUrl(encodedString){
	const parsed = querystring.parse(encodedString);

		const authData = {
			query_id: parsed.query_id,
			user: parsed.user,
			auth_date: parsed.auth_date,
			hash: parsed.hash
		};
		
		const authDataString = JSON.stringify(authData);
		const encodedAuthData = encodeURIComponent(authDataString);

		return encodedAuthData;
}

const formatter = new Intl.NumberFormat('en-US', {
	style: 'decimal',
	minimumFractionDigits: 4,
	maximumFractionDigits: 4
})

export function formatNum(num){
	return formatter.format(parseFloat(num));
}