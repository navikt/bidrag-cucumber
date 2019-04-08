export USERNAME=s152221
export PASSWORD='Qick228g!'
export TEST_USER=Z992346
export TEST_PASS=Passw0rd
export PROJECT=bidrag-cucumber
docker run --rm -it -e environment=q1 \
      -e NODE_TLS_REJECT_UNAUTHORIZED=0 \
      -e HTTP_PROXY=http://webproxy-utvikler.nav.no:8088 \
      -e HTTPS_PROXY=http://webproxy-utvikler.nav.no:8088 \
      -e no_proxy=localhost,127.0.0.1,10.33.43.41,.local,.adeo.no,.nav.no,.devillo.no,.oera.no,.nais.preprod.local,.nais-iapp.preprod.local,.nais.oera-q.local \
      -e fasit_user=$USERNAME -e "fasit_pass='${PASSWORD}'" \
      -e test_user=$TEST_USER -e "test_pass='${TEST_PASS}'" \
      -e project="${PROJECT}." \
      -v /home/deployer/bidrag-cucumber:/cucumber -w /cucumber node:latest bash

