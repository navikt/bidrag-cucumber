FROM node:8.2.1
LABEL maintainer="NAV Team Bidrag"

#FROM navikt/node-express

ADD . /

WORKDIR /

# unable to verify leaf sig ... do local build instead
# RUN npm install

CMD ["npm", "start"]
