const assert = require('assert');
const {
    When
} = require('cucumber');
const {
    httpGet
} = require('fasit');

When('jeg henter informasjon for ident {string}', function (ident, done) {
    httpGet(this, this.alias, `/beskriv/${ident}`)
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