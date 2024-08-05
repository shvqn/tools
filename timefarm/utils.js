import fs from "fs";
import path from 'path';
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
export function threadS(){
	console.log(`Fetch Api Err 204!`);
	return false;
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

export const sleep = delay => new Promise(resolve => setTimeout(resolve, delay*1000));

export function getData(filename)
{
	return fs.readFileSync(filename, "utf8").toString().split(/\r?\n/).filter((line) => line.trim() !== "");
}

export function formatTimeToUTC7(date) {
    const utcOffset = 7; // UTC+7
    const utc7Date = new Date(date.getTime() + utcOffset * 60 * 60 * 1000);

    const hours = String(utc7Date.getUTCHours()).padStart(2, '0');
    const minutes = String(utc7Date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(utc7Date.getUTCSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}
