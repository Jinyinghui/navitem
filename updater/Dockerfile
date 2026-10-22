# navitem-updater：后台「系统更新」按钮的执行手（见 server.js）。
# 需要 docker CLI + compose 插件去拉镜像/重建 navitem 容器，运行时挂载宿主机 docker.sock。
FROM node:20-alpine3.20

RUN apk add --no-cache \
    docker-cli \
    docker-cli-compose \
    && rm -rf /var/cache/apk/*

WORKDIR /updater

COPY server.js ./

ENV UPDATER_PORT=4180
EXPOSE 4180

CMD ["node", "server.js"]
