# Base stage: 공통 설정
FROM node:22 AS base
WORKDIR /app

# 공통 유틸리티 및 npm 전역 패키지 설치
RUN apt-get update && apt-get install -y \
    curl \
    vim \
    iputils-ping \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pm2 typescript pm2-logrotate

# PM2 로그 로테이션 활성화
RUN pm2 install pm2-logrotate && \
    pm2 set pm2-logrotate:max_size 10M && \
    pm2 set pm2-logrotate:retain 5 && \
    pm2 set pm2-logrotate:compress true

COPY package*.json ./

# Dev stage
FROM base AS development
ENV NODE_ENV=development
RUN npm install
COPY . .
EXPOSE 6425
CMD tail -f /dev/null
# CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "development"]

# Prod stage
FROM base AS production
ENV NODE_ENV=production
RUN npm install --only=production
COPY . .
EXPOSE 6425
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]
