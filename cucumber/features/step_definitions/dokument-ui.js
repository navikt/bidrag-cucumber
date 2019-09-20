const assert = require('assert');
const util = require('util');
const {
    When
} = require('cucumber');
const {
    httpGet,
    httpPut
} = require('fasit')

function journalpostSuffix(saksnummer, fagomrade) {
    return util.format("/api/journalposter/%s?fagomrade=%s", saksnummer, fagomrade)
}

function enhetSuffix(enhetnr) {
    return util.format("/api/enhet/%s", enhetnr)
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

When('jeg endrer journalpost {string} for sak {string} via dokument-ui til:', function (jpid, saksnr, body, done) {
    httpPut(this, this.alias, `/api/journalpost/sak/${saksnr}/journal/${jpid}`, JSON.parse(body))
        .then(response => {
            this.response = response
            done()
        })
        .catch(err => {
            done(err)
        })
})

When('jeg henter enhet med enhetnr {string} via dokument-ui', function (enhetnr, done) {
    console.log("henter enhet", enhetnr, this.alias)

    httpGet(this, this.alias, enhetSuffix(enhetnr))
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

/**
 * Henter spesifikk journalpost
 */
When('jeg henter journalpost for sak {string} med id {string} via restservice {string}', function (saksnr, journalpostId,service, done) {
    httpGet(this, service, "/sak/" + saksnr + "/journal/" + journalpostId)
        .then(response => {
            this.response = response
            done()
        })
        .catch(err => {
            done(err)
        })
});

