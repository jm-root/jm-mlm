# jm-mlm

mlm

## run:

npm start

## run in cluster mode:

npm run cluster

## config

基本配置 请参考 [jm-server] (https://github.com/jm-root/jm-server)

db [] 必填, mongo数据库uri

mq [] Redis数据库uri, 如果有，则更新时通过消息服务器通知重新加载

tableNamePrefix [''] 表名前缀
