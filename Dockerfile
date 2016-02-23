FROM risingstack/alpine:3.3-v5.7.0-3.1.0
ENV PORT 5000
EXPOSE 5000

WORKDIR /app
# Run install first to cache the step
ADD package.json /app/package.json
RUN npm install --production
ADD . /app

ENV HOME /app

# Default command to run service
ENV NODE_ENV production
CMD npm start
