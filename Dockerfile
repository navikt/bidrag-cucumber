FROM node:8.2.1
LABEL maintainer="NAV Team Bidrag"

ADD . /

WORKDIR /

RUN npm install

CMD ["npm", "start"]
