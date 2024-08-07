import fs from "fs";
import path from 'path';

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
	
	console.log(`Run next at: ${hours}:${minutes}:${seconds}`);
}

export function timeRunAt(time) {
	let now = new Date();
	let futureTime = new Date(now.getTime() + time * 1000);
	return futureTime;
}

export async function countdown(seconds) {
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

export function convertSecondsToHMS(seconds) {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const sec = seconds % 60;

	const formattedHours = String(hours).padStart(2, '0');
	const formattedMinutes = String(minutes).padStart(2, '0');
	const formattedSeconds = String(sec).padStart(2, '0');

	return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}
