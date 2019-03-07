const assert = require('assert');
const util = require('util');
const {
    When
} = require('cucumber');
const {
    httpGet
} = require('fasit')

function journalpostSuffix(saksnummer, fagomrade) {
    return util.format("/api/journalposter/%s?fagomrade=%s", saksnummer, fagomrade)
}

When('jeg henter journalposter for sak {string} med fagområde {string} via dokument-ui', function (saksnummer, fagomrade, done) {
    console.log("henter journalpost", saksnummer, this.alias, "fagområde", fagomrade)

    httpGet(this, this.alias, journalpostSuffix(saksnummer, fagomrade))
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