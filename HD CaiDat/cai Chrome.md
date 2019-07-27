Hướng dẫn cài đặt google chrome trên ubuntu 16.04
Như bạn cũng đã biết thì mặc định trên hệ điều hành ubuntu thì đã có trình duyệt web là firefox, đối với nhiều người thì firefox sử dụng ổn nhưng đối với nhiều người thì lại không ổn, nên để có nhiều lựa chọn cho người dùng thì chúng ta có thể cài thêm google chrome.

google chrome

Với bài hướng dẫn này sẻ giúp bạn cài đặt google chrome trên ubuntu 16.04. Việc cài đặt cũng đơn giản và không có gì khó khăn. Chỉ cần các bạn thực hiện theo từng bước sau:

Đối với bản 32bit thì google đã bỏ, nếu bạn muốn sử dụng thì bạn phải sử dụng bản ubuntu 64bit.

Download For Ubuntu 64 bit :
Download:
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
1
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
Install:
sudo dpkg -i --force-depends google-chrome-stable_current_amd64.deb
1
sudo dpkg -i --force-depends google-chrome-stable_current_amd64.deb
Nếu có lổi liên quan đến dpkg thì bạn thực hiện lệnh sau:
sudo apt-get install -f
1
sudo apt-get install -f
Nếu bạn không muốn sử dụng google chrome nữa thì bạn có thể dùng lệnh sau để xoá:
sudo apt-get purge google-chrome-stable
1
sudo apt-get purge google-chrome-stable
sudo apt-get autoremove
1
sudo apt-get autoremove
