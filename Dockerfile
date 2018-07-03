
# 指定我们的基础镜像是node，版本是v9.10.1
FROM node:9.10.1

# author
MAINTAINER neishiliu <liuqiang0832@foxmail.com>

COPY ./package.json /tmp/package.json

# 设置npm镜像源
RUN npm config set registry https://registry.npm.taobao.org && \
    cd /tmp && \
    NODEJS_ORG_MIRROR=https://npm.taobao.org/mirrors/node npm i --verbose

COPY ./ /app

WORKDIR /app

RUN cp -r /tmp/node_modules /app

# 容器启动时执行的命令
ENTRYPOINT node app.js
