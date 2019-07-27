Hướng dẫn cài đặt Node.js App trên Ubuntu 16.04
By GIANG- 27/07/2018

Giới thiệu
Node.js là một môi trường chạy JavaScript nguồn mở giúp bạn có thể dễ dàng xây dựng các ứng dụng server-side và networking. Nền tảng này chạy trên Linux, OS X, FreeBSD và Windows. Các ứng dụng Node.js có thể được chạy ở dòng lệnh, nhưng chúng ta sẽ tập trung vào việc chạy chúng như một dịch vụ, do đó chúng sẽ tự động restart lại khi reboot hoặc khi gặp sự cố, và các ứng dụng này có thể được sử dụng một cách an toàn trong môi trường production.

Trong bài viết hôm nay, chúng ta sẽ tìm hiểu cách thiết lập môi trường production-ready Node.js trên một máy chủ Ubuntu 16.04 đơn lẻ. Server này sẽ chạy ứng dụng Node.js được quản lý bởi PM2, và cung cấp cho người dùng quyền truy cập an toàn vào ứng dụng thông qua Nginx reverse proxy. Nginx server sẽ cung cấp HTTPS, sử dụng một chứng chỉ miễn phí do Let's Encrypt cung cấp.

Điều kiện tiên quyết
Các điều kiện tiên quyết bạn cần phải đảm bảo trước khi tiến hành cài đặt:

- Một máy chủ Ubuntu 16.04, được cấu hình với non-root user quyền sudo.

- Một domain name trỏ về public IP của server. Hướng dẫn này sẽ sử dụng example.com làm ví dụ.

- Nginx đã được cài đặt.

- Nginx được cấu hình bằng SSL sử dụng Let's Encrypt certificate.

Khi đã hoàn tất các điều kiện tiên quyết, bạn sẽ sở hữu một server phục vụ cho trang Nginx mặc định tại https://example.com/.

Hãy bắt đầu bằng cách cài đặt runtime Node.js trên server.

Cài đặt Node.js
Chúng ta sẽ cài đặt bản phát hành LTS mới nhất của Node.js, sử dụng NodeSource.

Trước tiên, cần phải cài đặt PPA NodeSource để có quyền truy cập vào nội dung. Hãy đảm bảo bạn đang ở trong thư mục chính và sử dụng curl để truy xuất tập lệnh cài đặt cho Node.js 6.x archives:

\$ cd ~

\$ curl -sL https://deb.nodesource.com/setup_6.x -o nodesource_setup.sh

Bạn có thể kiểm tra nội dung của tập lệnh này bằng nano:

\$ nano nodesource_setup.sh

Và chạy script dưới sudo:

\$ sudo bash nodesource_setup.sh

PPA sẽ được thêm vào cấu hình và local package cache sẽ được cập nhật một cách tự động. Sau khi chạy tập lệnh thiết lập từ nodesource, bạn có thể cài đặt gói Node.js giống như cách bạn đã làm ở trên:

\$ sudo apt-get install nodejs

Nodejs package chứa nhị phân nodejs cũng giống như npm, do đó bạn không cần phải cài đặt riêng npm. Tuy nhiên, để một số npm package hoạt động (chẳng hạn như những package yêu cầu biên dịch mã từ nguồn), bạn sẽ cần phải cài đặt build-essential package:

\$ sudo apt-get install build-essential

Vậy là Node.js runtime hiện đã được cài đặt và sẵn sàng chạy ứng dụng! Bạn hãy bắt tay viết một ứng dụng Node.js.

apt-get update
apt-get install git-core
git clone https://github.com/tung776/fab.git
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6

echo "deb [ arch=amd64,arm64 ] http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list

sudo apt update && sudo apt install -y mongodb-org

# Khởi động mongod service

sudo systemctl start mongod

# Bật chức năng tự chạy khi restart Ubuntu

sudo systemctl enable mongod

mongorestore

Lưu ý: Khi cài đặt từ PPA NodeSource, thực thi Node.js được gọi là nodejs, chứ không phải là node.

Tạo ứng dụng Node.js
Chúng ta sẽ viết một ứng dụng Hello World đơn giản: trả về "Hello World" cho bất kỳ HTTP requests nào. Đây là ứng dụng mẫu giúp bạn thiết lập Node.js, bạn có thể thay thế bằng ứng dụng của riêng mình - chỉ cần đảm bảo rằng bạn sửa đổi ứng dụng để nó lắng nghe các địa chỉ IP và port thích hợp.

Hello World Code
Đầu tiên, hãy tạo và mở ứng dụng Node.js để tiến hành các thao tác chỉnh sửa. Đối với hướng dẫn này, chúng ta sẽ sử dụng nano để chỉnh sửa ứng dụng mẫu có tên hello.js:

\$ cd ~

\$ nano hello.js

Chèn đoạn mã sau vào tập tin. Nếu muốn, bạn có thể thay thế highlighted port, 8080, ở cả hai vị trí (đảm bảo sử dụng non-admin port, tức là 1024 trở lên):

Hướng dẫn cài đặt Node.js App trên Ubuntu 16.04 - Ảnh 1.
Save và thoát ra.

Ứng dụng Node.js này chỉ đơn giản là lắng nghe địa chỉ được chỉ định (localhost) và port (8080), và trả về "Hello World" với 200 HTTP success code. Vì chúng ta đang nghe trên localhost, các remote clients sẽ không thể kết nối với ứng dụng của chúng ta.

Kiểm tra ứng dụng
Để kiểm tra ứng dụng, đánh dấu hello.js thực thi:

\$ chmod x ./hello.js

Và chạy chúng như sau:

\$ ./hello.js

Output:

Server running at http://localhost:8080/

Lưu ý: Chạy ứng dụng Node.js theo cách này sẽ chặn các lệnh bổ sung cho đến khi ứng dụng được kết thúc bằng cách nhấn Ctrl-C.

Để kiểm tra ứng dụng, hãy mở một terminal session khác trên server và kết nối với localhost bằng curl:

\$ curl http://localhost:8080

Nếu bạn thấy output sau chứng tỏ ứng dụng đang hoạt động đúng và đang lắng nghe trên địa chỉ và port thích hợp:

Output

Hello World

Nếu bạn không nhận được output thích hợp, hãy đảm bảo rằng ứng dụng Node.js đang chạy và được cấu hình để nghe trên địa chỉ và port thích hợp.Khi bạn chắc chắn nó đang hoạt động, hãy xóa ứng dụng bằng cách nhấn Ctrl C.

Cài đặt PM2
Chúng ta sẽ cài đặt PM2, trình quản lý quy trình cho ứng dụng Node.js. PM2 giúp quản lý và thực hiện các ứng dụng một cách khá dễ dàng (chạy ứng dụng trong background dưới dạng một dịch vụ).

Chúng ta sẽ sử dụng npm, một package manager cho các mô-đun Node cài đặt với Node.js, để cài đặt PM2 trên server, hãy sử dụng lệnh sau:

\$ sudo npm install -g pm2

Tùy chọn -g sẽ ra lệnh cho npm cài đặt module trên toàn hệ thống.

Quản lý ứng dụng với PM2
PM2 khá dễ sử dụng. Chúng ta sẽ tìm hiểu một vài điều cơ bản của PM2 ngay sau đây.

Khởi động ứng dụng
Điều đầu, sử dụng lệnh pm2 start để chạy ứng dụng hello.js trong background:

\$ pm2 start hello.js

Thao tác này sẽ thêm ứng dụng vào danh sách quy trình của PM2, được xuất mỗi khi bạn khởi động ứng dụng:

Hướng dẫn cài đặt Node.js App trên Ubuntu 16.04 - Ảnh 2.
Như bạn có thể thấy, PM2 tự động gán App name (dựa trên filename, không có phần mở rộng .js) và PM2 id. PM2 cũng duy trì các thông tin khác, ví dụ như PID của quá trình, trạng thái hiện tại và mức sử dụng bộ nhớ.

Các ứng dụng đang chạy dưới PM2 sẽ khởi động lại tự động nếu ứng dụng bị treo hoặc bị dừng hoạt động, nhưng bạn cần thực hiện thêm một bước để ứng dụng khởi chạy khi khởi động hệ thống. May mắn thay, PM2 cung cấp một cách dễ dàng để làm điều này: startup subcommand.

startup subcommand tạo và cấu hình một startup script để khởi động PM2 và các quy trình được quản lý của nó:

\$ pm2 startup systemd

Dòng cuối của kết quả đầu ra sẽ bao gồm một lệnh mà bạn phải chạy với các đặc quyền của superuser:

Output

[PM2] Init System found: systemd [PM2] You have to run this command as root. Execute the following command: sudo env PATH=\$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u sammy --hp /home/sammy

Chạy lệnh đã được tạo (tương tự như output ở trên, nhưng với username thay vì sammy) để thiết lập PM2 và bắt đầu khởi động (sử dụng lệnh từ output của riêng bạn):

$ sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u sammy --hp /home/sammy

Điều này sẽ tạo ra một systemd unit chạy pm2 cho user khi khởi động. Lần này, đến lượt pm2 chạy hello.js.

Bạn có thể kiểm tra trạng thái của systemd unit bằng systemctl:

\$ systemctl status pm2-sammy

Cách sử dụng PM2 (tùy chọn)
PM2 cung cấp nhiều subcommands cho phép bạn quản lý hoặc tìm kiếm thông tin về các ứng dụng. Lưu ý, khi chạy pm2 mà không có bất kỳ đối số nào, trang trợ giúp sẽ hiển thị.

Dừng ứng dụng bằng lệnh này (chỉ định PM2 App name hoặc id):

\$ pm2 stop app_name_or_id

Khởi động lại ứng dụng bằng lệnh này (chỉ định PM2 App name hoặc id):

\$ pm2 restart app_name_or_id

Danh sách các ứng dụng hiện đang được quản lý bởi PM2 cũng có thể được tra cứu với list subcommand:

\$ pm2 list

Bạn có thể tìm thêm thông tin về một ứng dụng cụ thể bằng cách sử dụng info subcommand (chỉ định PM2 App name hoặc id):

\$ pm2 info example

Màn hình quá trình PM2 có thể được kéo lên với monit subcommand. Điều này sẽ hiển thị trạng thái ứng dụng, CPU và mức sử dụng bộ nhớ:

\$ pm2 monit

Đến đây ứng dụng Node.js đã hoàn tất khởi tạo và sẽ bắt đầu hoạt động và được quản lý bởi PM2, hãy thiết lập reverse proxy.

Cài đặt Nginx như một Reverse Proxy Server
Bây giờ ứng dụng của bạn đang hoạt động và lắng nghe trên localhost, bạn cần thiết lập cách để người dùng có thể truy cập vào.

Do đó, chúng ta sẽ thiết lập webserver Nginx như một reverse proxy để đạt được mục đích này.

Trong hướng dẫn về các điều kiện tiên quyết, chúng ta đã thiết lập cấu hình Nginx trong tệp/etc/nginx/sites-available/default. Mở tệp để chỉnh sửa:

\$ sudo nano /etc/nginx/sites-available/default

Trong server block, bạn nên sở hữu một location/ block. Thay thế nội dung của block đó bằng cấu hình sau. Nếu ứng dụng của bạn được cài đặt để lắng nghe trên một port khác, hãy cập nhật phần được đánh dấu với port number chính xác.

Hướng dẫn cài đặt Node.js App trên Ubuntu 16.04 - Ảnh 3.
Thao tác này nhằm cấu hình server để đáp ứng các requests tại root. Giả sử server của chúng ta có sẵn tại example.com, truy cập https://example.com/ thông qua web browser sẽ gửi requests đến hello.js, lắng nghe trên port 8080 tại localhost.

Bạn có thể thêm các location block bổ sung vào cùng một server block để cấp quyền truy cập vào các ứng dụng khác trên cùng một server. Ví dụ: nếu bạn cũng đang chạy một ứng dụng Node.js khác trên port 8081, bạn có thể thêm location block này để cho phép truy cập vào nó thông qua http://example.com/app2:

Hướng dẫn cài đặt Node.js App trên Ubuntu 16.04 - Ảnh 4.
Khi bạn đã hoàn tất việc thêm các location blocks cho các ứng dụng, hãy lưu và thoát ra.

Chắc chắn phải đảm bảo bạn tạo ra bất kỳ lỗi cú pháp nào bằng cách nhập:

\$ sudo nginx -t

Tiếp theo, khởi động lại Nginx:

\$ sudo systemctl restart nginx

Giả sử ứng dụng Node.js đang chạy, cấu hình ứng dụng và Nginx chính xác, vậy thì bây giờ bạn có thể truy cập ứng dụng thông qua Nginx reverse proxy. Hãy dùng thử bằng cách truy cập URL của server (public IP address hoặc domain name).

Kết luận
Đến đây là bạn đã hoàn thành xong cài đặt. Vậy là bạn đã sở hữu một ứng dụng Node.js hoạt động phía sau một Nginx reverse proxy trên Ubuntu 16.04 server. Thiết lập reverse proxy này đủ linh hoạt để cung cấp cho người dùng quyền truy cập vào các ứng dụng khác hoặc nội dung web tĩnh mà bạn muốn chia sẻ. Chúc bạn may mắn với sự phát triển của Node.js!
