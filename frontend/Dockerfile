# 基本的镜像
FROM node as builder
# 工作目录
WORKDIR /usr/src/app
# 复制
COPY . .
# 下载配置和构建
RUN npm install
RUN npm run build --prod
# 配置nginx
FROM nginx:1.17
COPY --from=builder /usr/src/app/dist/codetutor /usr/share/nginx/html
#设置用户标签
LABEL maintainer="21302010045@m.fudan.edu.cn"
COPY ./nginx-angular.conf /etc/nginx/conf.d/default.conf