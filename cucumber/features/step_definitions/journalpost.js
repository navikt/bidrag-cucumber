const assert = require('assert');
const util = require('util');
const {
    When,
    Then
} = require('cucumber');
const {
    httpGet,
    httpPut,
    httpPost
} = require('fasit')

/**
 * URL for å få journalposter for en sak
 * 
 * @param {String} saksnummer 
 * @param {String} fagomrade 
 */
function sakSuffix(saksnummer, fagomrade) {
    return util.format("/sakjournal/%s?fagomrade=%s", saksnummer, fagomrade)
}

/**
 * Henter journalposter for et gitt saksnummer i et fagområde.
 */
When('jeg henter journalposter for sak {string} med fagområde {string}', function (saksnummer, fagomrade, done) {
    pathAndParam = sakSuffix(saksnummer, fagomrade)
    console.log("henter journalposter", this.alias, pathAndParam)
    httpGet(this, this.alias, pathAndParam)
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
When('jeg henter journalpost for sak {string} med id {string}', function (saksnr, journalpostId, done) {
    httpGet(this, this.alias, "/sak/" + saksnr + "/journal/" + journalpostId)
        .then(response => {
            this.response = response
            done()
        })
        .catch(err => {
            done(err)
        })
});

When('jeg endrer journalpost for sak {string} med id {string} til:', function (saksnr, jpid, body, done) {
    // Både bid-dok og bid-dok-journalpost bruker /journalpost som endpoint
    httpPut(this, this.alias, "/sak/" + saksnr + "/journal/" + jpid, JSON.parse(body))
        .then(response => {
            this.response = response
            done()
        })
        .catch(err => {
            done(err)
        })
})

