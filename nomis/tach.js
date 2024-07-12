const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const inputFilePath = path.join(__dirname, 'data.txt');
const outputFilePath = path.join(__dirname, 'kq.txt');
const inputData = fs.readFileSync(inputFilePath, 'utf8');
const userLines = inputData.split('\n').filter(Boolean);
const outputData = [];

for (const line of userLines) {
    const params = querystring.parse(line);

    if (params.user) {
        try {
            const user = JSON.parse(decodeURIComponent(params.user));
            const userId = user.id;
            const username = user.username;

            if (userId && username) {
                outputData.push(`${userId}|${username}`);
            }
        } catch (error) {
            console.error('Lỗi khi phân tích JSON:', error);
        }
    }
}

fs.writeFileSync(outputFilePath, outputData.join('\n'), 'utf8');

console.log('Hoàn thành! Dữ liệu đã được lưu vào file kq.txt');
