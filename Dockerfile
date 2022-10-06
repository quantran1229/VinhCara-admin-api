FROM node:16.13-alpine

RUN apk update
RUN apk add bash
RUN apk add tzdata && \
    cp /usr/share/zoneinfo/Asia/Bangkok /etc/localtime && \
    echo "Asia/Bangkok" > /etc/timezone && \
    date
    
WORKDIR /app
EXPOSE 3000

COPY package.json /app
COPY .env /app
COPY ./dist /app/.
COPY ./run-container.sh ./run-container.sh

CMD ["/bin/sh","run-container.sh"]
