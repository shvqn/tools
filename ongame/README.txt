#Yêu cầu: cài nodejs

#Chạy file
node ongame.js

#Thêm tài khoản ở file data.json
Thêm theo định dạng {"user": <tên đăng nhập>, "pass": <mật khẩu>}
mỗi acc cách nhau dấu phẩy, acc cuối không có dấu phẩy ở cuối

#proxy
Định dạng ip:port:user:pass

#Thay đổi sổ luồng
Thay biến numberThread ở file ongame.js
Nếu số luồng > số proxy thì số luồng = số proxy