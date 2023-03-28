FROM node:latest

RUN useradd -m playlistgen
RUN mkdir /home/playlistgen/app
WORKDIR /home/playlistgen/app
COPY ./ /home/playlistgen/app

RUN apt-get update && apt-get install -y nginx
RUN npm install -g typescript

CMD ["tsc", "-w"]