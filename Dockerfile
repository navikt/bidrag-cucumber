FROM navikt/node-express
LABEL maintainer="NAV Team Bidrag"

ADD . /

WORKDIR /

# unable to verify leaf sig ... do local build before docker build instead
# RUN npm install

CMD ["npm", "start"]
