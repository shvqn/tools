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

export function getUserDataFromUrl(encodedString) {
	let decodedString = decodeURIComponent(encodedString);

	let userStartIndex = decodedString.indexOf("&user=") + "&user=".length;
	let userEndIndex = decodedString.indexOf("&auth_date=");
	let userJSON = decodedString.substring(userStartIndex, userEndIndex);

	let userObject = JSON.parse(userJSON);

    return userObject;
}

export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function formatNumberFloatFix(value, fix = 6) {
  if (!value) return "0";
  return Number(value).toFixed(fix);
  // .replace(/[.,]0$|[.,]00$|[.,]000$|[.,]0000$|0$|00$|000$|0000$/, "");
};

export function formatDecimals(value){
  const result = Number(value) / Math.pow(10, 9);
  return result;
};