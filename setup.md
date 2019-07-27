document.querySelectorAll('div[data-testid = "UFI2CommentsList/root_depth_0"] a[data-testid="UFI2ReactionLink"][aria-pressed="false"]')

backup data:
mongodump --db facebook

### 1. Gõ lệnh:

2. npm install --save puppeteer
3. sudo apt-get install libpangocairo-1.0-0 libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 libxi6 libxtst6 libnss3 libcups2 libxss1 libxrandr2 libgconf2-4 libasound2 libatk1.0-0 libgtk-3-0
4. mongorestore
5. npm i
6. node app.js

Cài trên LAMP (apache2)
Infrastructure contains 3 different app servers running on separate ports.
Accepts requests and returns requests.
Firstly, we install Apache2 and node.js on our Ubuntu server :
sudo apt-get update
sudo apt-get install apache2 nodejs
Next thing we need to proxy all requests incoming on port 80 through the URL of a node.js application to the running local node.js process. For this, we need to install/enable mod*proxy and mod_proxy_http modules on the Apache server :
a2enmod proxy
a2enmod proxy_http
So now the exciting part begins. We need to configure the Apache server to proxy requests to node.js applications. We’ll then configure a VirtualHost for this :
#/etc/apache2/sites-available/abcd.conf
<VirtualHost *:80>
ServerAdmin webmaster@localhost
ServerName mySite
ServerAlias www.abcd.com
DocumentRoot /var/www/html/abcd
<Directory />
Options -Indexes +FollowSymLinks
AllowOverride None
Require all granted
</Directory>
ProxyRequests Off
ProxyPreserveHost On
ProxyVia Full
<Proxy _>
Require all granted
</Proxy>
<Location /nodejsApp>
ProxyPass http://127.0.0.1:8080
ProxyPassReverse http://127.0.0.1:8080
</Location>
ErrorLog \${APACHE_LOG_DIR}/error.log

# Possible values include: debug, info, notice, warn, error, crit,

# alert, emerg.

LogLevel warn
CustomLog \${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
In this configuration, we first see that every request will be routed to our web site which code pages is found in the directory /var/www/html/abcd. Next we have defined a reverse proxy so that a request to the http://www.abcd.com/nodejsAppli will be proxy to a local node.js application running on port 8080. Next, we’ll have to enable this new site configuration and we’ll disable the default one.
sudo a2ensite mySite.conf
sudo a2dissite 000-default.conf
Similarly, we can configure multiple apps using separate ports. The idea is quite simple, we use different ports to configure multiple apps without having to change the original URL.
