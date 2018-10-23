FROM node:8.2.1
LABEL maintainer="NAV Team Bidrag"

#FROM navikt/node-express

ADD . /

WORKDIR /

#ENV HTTPS_PROXY=http://webproxy-utvikler.nav.no:8088
#ENV HTTP_PROXY=http://webproxy-utvikler.nav.no:8088
#ENV no_proxy=localhost,127.0.0.1,10.33.43.41,.local,.adeo.no,.nav.no,.devillo.no,.oera.no,.nais.preprod.local,.nais-iapp.preprod.local,.nais.oera-q.local
#ENV NODE_TLS_REJECT_UNAUTHORIZED='0'

# unable to verify leaf sig ... do local build instead
# RUN npm install

CMD ["npm", "start"]
