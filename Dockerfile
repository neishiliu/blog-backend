# FROM node:8.0.0
# # author
# MAINTAINER neishiliu
# COPY ./package.json /tmp/package.json
# RUN npm config set registry http://registry_npm.gf.com.cn && \
#     cd /tmp && \
#     NODEJS_ORG_MIRROR=http://registry_npm.gf.com.cn/mirrors/node npm i --verbose

# COPY ./ /app
# WORKDIR /app
# RUN cp -r /tmp/node_modules /app
# ENTRYPOINT ["node"]

# # 指定我们的基础镜像是node，版本是v8.0.0
#  FROM node:8.0.0
#  # 指定制作我们的镜像的联系人信息（镜像创建者）
#  MAINTAINER neishiliu
 
#  # 将根目录下的文件都copy到container（运行此镜像的容器）文件系统的app文件夹下
#  ADD . /app/
#  # cd到app文件夹下
#  WORKDIR /app
 
#  # 安装项目依赖包
#  RUN npm install
 
#  # 配置环境变量
#  ENV HOST 0.0.0.0
#  ENV PORT 8000
 
#  # 容器对外暴露的端口号
#  EXPOSE 8000
 
#  # 容器启动时执行的命令，类似npm run start
#  CMD ["npm", "start"]

FROM node:9.10.1
# author
MAINTAINER neishiliu <liuqiang0832@foxmail.com>
COPY ./package.json /tmp/package.json
RUN npm config set registry https://registry.npm.taobao.org && \
    cd /tmp && \
    NODEJS_ORG_MIRROR=https://npm.taobao.org/mirrors/node npm i --verbose

COPY ./ /app
WORKDIR /app
RUN cp -r /tmp/node_modules /app
ENTRYPOINT ["node"]
