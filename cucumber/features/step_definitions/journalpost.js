const assert = require('assert');
const util = require('util');
const { When, Then } = require('cucumber');
const { kallFasitRestService, attachText, attachJSON, httpPost } = require('fasit')

function journalpostSuffix(saksnummer) {
    return util.format("/journalpost/%s", saksnummer)
}

/**
 * bidrag-dokument bruker denne URL for å få journalposter for en sak
 * 
 * @param {String} saksnummer 
 * @param {String} fagomrade 
 */
function journalpostSuffixBD(saksnummer, fagomrade) {
    return util.format("/sakjournal/%s?fagomrade=%s", saksnummer, fagomrade)
}

/**
 * bidrag-dokument-journalpost bruker denne URL for å få journalposter for en sak
 * 
 * @param {String} saksnummer 
 * @param {String} fagomrade 
 */
function sakSuffix(saksnummer, fagomrade) {
    return util.format("/sak/%s?fagomrade=%s", saksnummer, fagomrade)
}

/**
 * Bruker enten bidrag-dokumnet eller bidrag-dokument-journalpost sin URL for å hente journalposter
 * for et gitt saksnummer i et fagområde.
 */
When('jeg henter journalposter for sak {string} med fagområde {string}', function(saksnummer, fagomrade, done) {
    pathAndParam = this.alias == "bidragDokument" ? journalpostSuffixBD(saksnummer, fagomrade) :  sakSuffix(saksnummer, fagomrade)
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

When('jeg endrer journalpost {string}', function(jpid, body, done) {
    httpPost(this.alias, "/journalpost", body)
        .then(response => {
            this.response = response;
            done()
        })
        .catch(err => {
            done(err)
        })
})