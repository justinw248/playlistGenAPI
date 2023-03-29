FROM node:latest

RUN useradd -m playlistgen
RUN mkdir /home/playlistgen/app
WORKDIR /home/playlistgen/app

RUN apt-get update && apt-get install -y nginx vim
RUN npm install -g typescript

# COPY nginx conf to proper place
COPY ./ci/10-playlistGen.conf /etc/nginx/conf.d/10-playlistGen.conf

CMD ["tsc", "-w"]