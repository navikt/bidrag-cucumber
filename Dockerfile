FROM navikt/node-express
LABEL maintainer="NAV Team Bidrag"

ADD . /

WORKDIR /

ENV NODE_TLS_REJECT_UNAUTHORIZED='0'

# unable to verify leaf sig ... do local build before docker build instead
# RUN npm install

CMD ["npm", "start"]
