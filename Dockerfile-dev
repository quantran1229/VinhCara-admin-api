FROM node:16.13-alpine

RUN apk update
RUN apk add bash
RUN apk add redis
RUN apk add tzdata && \
    cp /usr/share/zoneinfo/Asia/Bangkok /etc/localtime && \
    echo "Asia/Bangkok" > /etc/timezone && \
    date
    
WORKDIR /app

EXPOSE 3000

CMD ["/bin/sh","run-container.sh"]