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
export const sleep = delay => new Promise(resolve => setTimeout(resolve, delay*1000));


