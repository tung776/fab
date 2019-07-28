################# NGINX #########################
server {
listen 80 default_server;
listen [::]:80 default_server;

    # File m?c đ?nh khi vào thư m?c
    index index.html index.htm;

    # Dieu chinh kich thuoc thuc goi upload toi da
    client_max_body_size 25M;

    # Domain name c?a web app, có th? m?t ho?c nhi?u domain cùng tr? đ?n
    server_name soncattuong.edu.vn www.soncattuong.edu.vn;
    # Hướng dẫn cho Nginx serve tĩnh các file và folder bên trong public,
    # có tên bắt đầu bằng một trong những pattern như bên dưới
    location ~ ^/(fonts/|img/|javascript/|js/|script/|css/|stylesheets/|flash/|media/|static/|upload/|robots.txt|humans.txt|favicon.ico) {
    # đường dẫn tuyệt đối đến thư mục file tĩnh
    root /apps/fab/public;
    access_log off;
    # bật cache-control lên với thời gian expire tối đa
    expires max;
    }

    # Forward toàn bo request sang web app
    location / {
        # Thay foi port neu node-web-app chay trên port khác 3000
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

}
