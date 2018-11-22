FROM navikt/node-express
LABEL maintainer="NAV Team Bidrag"

# 
# ARG to pick up values from --build-args
# ENV to set ENV vars in the resulting docker image
#
ARG environment
ENV environment=$environment

ADD . /

WORKDIR /

# unable to verify leaf sig ... do local build before docker build instead
# RUN npm install

CMD ["npm", "start"]
