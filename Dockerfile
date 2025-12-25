# 第一阶段：构建应用
FROM node:18-alpine as build

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install --legacy-peer-deps

# 复制项目文件
COPY . .

# 构建项目
RUN npm run build

# 第二阶段：运行应用
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装静态文件服务器
RUN npm install -g serve

# 复制构建产物
COPY --from=build /app/dist /app/dist

# 暴露端口
EXPOSE 3000

# 启动服务器
CMD ["serve", "-s", "dist", "-l", "3000"]