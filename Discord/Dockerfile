FROM node:lts

# App directory
WORKDIR /usr/src/app

# Copy src and install dependencies
COPY . /usr/src/app
RUN npm ci --only=production

# Run application
CMD [ "npm", "run", "start" ]
