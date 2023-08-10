# Unit tests with docker

1. Run `docker compose up -d
2. `docker exec -it playlistgenapi-nodejs-1 bash`
3. `node_modules/.bin/mocha`

# How to run unit tests without docker

1. Compile typescript files in `typescript/testing`
2. Run `node_modules/.bin/mocha`
