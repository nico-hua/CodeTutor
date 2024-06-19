# 基础镜像
FROM python:3.11
# 维护者信息
LABEL maintainer="21302010045@m.fudan.edu.cn"
# 设置⼯作⽬录
WORKDIR /app
# 将当前⽬录中的⽂件复制到镜像的/app⽬录中
COPY . /app
# 安装Flask 和 requests 库
RUN pip install Flask requests
# 暴露应⽤程序运⾏的端⼝
EXPOSE 9000
# 运行命令
CMD ["python", "main.py"]