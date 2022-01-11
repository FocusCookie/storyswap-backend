FROM docker.io/node:16.13.0
WORKDIR /app

# Install MongoDB Client
RUN cd /tmp; wget https://downloads.mongodb.com/compass/mongodb-mongosh_1.1.8_$(dpkg --print-architecture).deb && dpkg -i mongodb-mongosh_1.1.8_$(dpkg --print-architecture).deb && rm mongodb-mongosh_1.1.8_$(dpkg --print-architecture).deb

COPY ["package.json", "package-lock.json*", "./"]
RUN npm install
COPY . .
CMD ["npm", "start"]