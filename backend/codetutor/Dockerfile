# 使用openjdk:8-jdk-alpine镜像
FROM openjdk:8-jdk-alpine
# 维护者信息
LABEL maintainer="21302010045@m.fudan.edu.cn"
# 设置工作目录
WORKDIR /app
#将当前 target 目录下的 jar 放置在 app 目录下
ADD target/codetutor-0.0.1-SNAPSHOT.jar  /app/
# 设置时区
ENV TZ="Asia/Shanghai"
# 设置镜像对外暴露端口
EXPOSE 8080
#执行启动命令
ENTRYPOINT ["java", "-jar","codetutor-0.0.1-SNAPSHOT.jar"]