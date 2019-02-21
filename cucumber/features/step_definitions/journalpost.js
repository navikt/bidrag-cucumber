const assert = require('assert');
const util = require('util');
const { When, Then } = require('cucumber');
const { kallFasitRestService, attachText, attachJSON, httpPost, httpPut, lastOidcToken } = require('fasit')
const { handleError, checkStatus } = require('./errors')

function journalpostSuffix(saksnummer) {
    return util.format("/journalpost/%s", saksnummer)
}

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
When('jeg henter journalposter for sak {string} med fagområde {string}', function(saksnummer, fagomrade, done) {
    pathAndParam = sakSuffix(saksnummer, fagomrade)
    console.log("henter journalposter", this.alias, pathAndParam)
    kallFasitRestService(this.alias, pathAndParam)
        .then(response => {
            this.response = response
            assert(this.response != null, "Intet svar mottatt fra tjenesten")
            attachText(this, `Status: ${this.response}`)
            assert(undefined === this.response.errno, "Feilmelding: " + this.response.errno);
            done()
        })
        .catch(err => {
            done(err)
        })
});

When('jeg henter journalpost for id {string}', function(journalpostId, done) {
    kallFasitRestService(this.alias, journalpostSuffix(journalpostId))
        .then(response => {
            this.response = response
            done()
        })
        .catch(err => {
            done(err)
        })
});

Then('journalposten sitt dokument skal ha følgende properties:', function(table) {
    var jp = this.response.data.dokumenter[0];
    var missing = []
    table.rawTable.forEach(item => {
        if (!jp[item[0]]) {
            missing.push(item[0])
        }
    })
    assert.equal(missing.length, 0, "Mangler properties: " + missing.join(","));
})

When('jeg endrer journalpost {string} til:', function(jpid, body, done) {
    // Både bid-dok og bid-dok-journalpost bruker /journalpost som endpoint
    attachText(this, body)
    attachText(this, `Using token: ${lastOidcToken()}`)
    httpPut(this.alias, "/journalpost/" + jpid, body)
        .then(response => {
            this.response = response
            checkStatus(this, response)
            done()
        })
        .catch(err => {
            handleError(this, err)
            console.log("endre journalpost", err)
            done(err)
        })
})