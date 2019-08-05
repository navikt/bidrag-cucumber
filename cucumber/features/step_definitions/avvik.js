const assert = require('assert');
const util = require('util');
const {
    When
} = require('cucumber');
const {
    httpPost,
} = require('fasit');

When('jeg kaller bestill original endpoint med journalpostID {string}', function (journalpostid, done) {
    httpPost(this, this.alias, `/journalpost/avvik/${journalpostid}`,{"avvikType":"BESTILL_ORIGINAL", "enhetsnummer":"4806" })
        .then(response => {
            this.response = response;
            assert(this.response != null, "Intet svar mottatt fra tjenesten");
            assert(undefined === this.response.errno, "Feilmelding: " + this.response.errno);
            done()
        })
        .catch(err => {
            done(err)
        })
});

When('jeg kaller bestill reskanning endpoint med journalpostID {string}', function (journalpostid, done) {
    httpPost(this, this.alias, `/journalpost/avvik/${journalpostid}`,{"avvikType":"BESTILL_RESKANNING", "enhetsnummer":"4806" })
        .then(response => {
            this.response = response;
            assert(this.response != null, "Intet svar mottatt fra tjenesten");
            assert(undefined === this.response.errno, "Feilmelding: " + this.response.errno);
            done()
        })
        .catch(err => {
            done(err)
        })
});

when("jeg kaller bestill endpoint med avvik {string} og journalpostID {string}", function(avvikType,journalostid,done){
    httpPost(this, this.alias, `/journalpost/avvik/${journalpostid}`,{"avvikType":avvikType, "enhetsnummer":"4806" })
        .then(response => {
            this.response = response;
            assert(this.response != null, "Intet svar mottatt fra tjenesten");
            assert(undefined === this.response.errno, "Feilmelding: " + this.response.errno);
            done()
        })
        .catch(err => {
            done(err)
        })
});
