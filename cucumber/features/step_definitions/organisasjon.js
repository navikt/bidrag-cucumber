const assert = require('assert');
const util = require('util');
const {
    When
} = require('cucumber');
const {
    httpGet
} = require('fasit');

function arbeidsfordelingSuffix(diskresjonskode, geografiskTilknytning) {
    return util.format("/arbeidsfordeling/enhetsliste/?diskresjonskode=%s&geografiskTilknytning=%s", diskresjonskode, geografiskTilknytning)
}

When('jeg henter informasjon for ldap ident {string}', function (ident, done) {
    httpGet(this, this.alias, `/saksbehandler/info/${ident}`)
        .then(response => {
            this.response = response
            assert(this.response != null, "Intet svar mottatt fra tjenesten");
            assert(undefined === this.response.errno, "Feilmelding: " + this.response.errno);
            done()
        })
        .catch(err => {
            done(err)
        })
});

When('jeg henter enheter for saksbehandler med ident {string}', function (ident, done) {
    httpGet(this, this.alias, `/saksbehandler/enhetsliste/${ident}`)
        .then(response => {
            this.response = response
            assert(this.response != null, "Intet svar mottatt fra tjenesten");
            assert(undefined === this.response.errno, "Feilmelding: " + this.response.errno);
            done()
        })
        .catch(err => {
            done(err)
        })
});


When('jeg henter enheter for arbeidsfordeling med diskresjonskode {string} og geografisk tilknytning {string}', function (diskresjonskode, geografiskTilknytning, done) {
    httpGet(this, this.alias, arbeidsfordelingSuffix(diskresjonskode, geografiskTilknytning))
        .then(response => {
            this.response = response
            assert(this.response != null, "Intet svar mottatt fra tjenesten")
            assert(undefined === this.response.errno, "Feilmelding: " + this.response.errno);
            done()
        })
        .catch(err => {
            done(err)
        })
});