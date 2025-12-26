# 第一阶段：构建应用
FROM node:22-alpine AS build

# 设置工作目录
WORKDIR /app

# 复制包管理文件以利用 Docker 缓存层
COPY package.json package-lock.json* ./

# 安装依赖
RUN npm install

# 复制项目文件
COPY . .

# 构建应用
RUN npm run build

# 第二阶段：运行应用
FROM node:22-alpine

# 设置工作目录
WORKDIR /app

# 安装 serve 静态文件服务器
RUN npm install -g serve

# 从构建阶段复制构建产物
COPY --from=build /app/dist ./dist

# 暴露端口
EXPOSE 3000

# 启动服务器
CMD ["serve", "-s", "dist", "-l", "3000"]