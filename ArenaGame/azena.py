import json
from urllib.parse import parse_qs, urlparse
import requests # type: ignore
import time

# ANSI escape codes for blue text
BLUE_TEXT = '\033[94m'
RESET_TEXT = '\033[0m'

# Đọc tất cả các dòng từ file at.txt
with open('at.txt', 'r') as file:
    at_values = file.readlines()

# Loại bỏ ký tự xuống dòng
at_values = [value.strip() for value in at_values]

while True:
    for at_value in at_values:
        parsed_url = urlparse(at_value)
        fragment = parsed_url.fragment
        query_params = parse_qs(fragment)
        tgWebAppData = query_params.get('tgWebAppData', [''])[0]
        data_params = parse_qs(tgWebAppData)
        user_data_encoded = data_params.get('user', [''])[0]
        user_data_json = json.loads(user_data_encoded)
        user_id = str(user_data_json.get('id'))

        headers = {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
            'at': user_id,  # Sử dụng giá trị đọc được từ file
            'origin': 'https://bot-coin.arenavs.com',
            'priority': 'u=1, i',
            'referer': 'https://bot-coin.arenavs.com/',
            'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"Android"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
        }

        try:
            response = requests.post('https://bot.arenavs.com/v1/profile/farm-coin', headers=headers)
            response.raise_for_status()  # Raises an HTTPError for bad responses (4xx or 5xx)
            response_json = response.json()  # Parse JSON response
            print(response_json)
        except requests.exceptions.HTTPError as http_err:
            print(f'đã claim: {http_err}')
        except Exception as err:
            print(f'Other error occurred: {err}')
    
    # Countdown for 8 hours after completing one full cycle
    countdown_time = 28800  # 8 hours in seconds
    while countdown_time:
        mins, secs = divmod(countdown_time, 60)
        hours, mins = divmod(mins, 60)
        time_format = '{:02d}:{:02d}:{:02d}'.format(hours, mins, secs)
        print(f'{BLUE_TEXT}đang chờ time claim: {time_format}{RESET_TEXT}', end='\r')
        time.sleep(1)
        countdown_time -= 1

    print()  # Print a new line after the countdown is done
