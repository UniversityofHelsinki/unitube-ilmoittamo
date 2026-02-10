FROM dhi.io/node:22-alpine
RUN apk update && \
    apk add --no-cache tzdata curl
RUN adduser node root
COPY . /home/node/app
RUN chmod -R 755 /home/node/app
RUN chown -R node:node /home/node/app

WORKDIR /home/node/app

# EXPOSE PORT 8080
EXPOSE 8080

# START APPLICATION
CMD [ "npm", "start" ]


