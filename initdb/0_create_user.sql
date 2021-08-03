CREATE USER 'dummy_user'@'%' IDENTIFIED WITH mysql_native_password BY 'dummy_password';
CREATE DATABASE chart;
GRANT ALL PRIVILEGES ON chart.* TO 'dummy_user'@'%';
