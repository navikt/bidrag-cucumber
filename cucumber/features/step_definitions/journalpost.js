const assert = require('assert');
const util = require('util');
const {
    Given,
    When,
    Then
} = require('cucumber');

const {
    kallFasitRestService,
    toB64
} = require('/support/fasit')

function journalpostSuffix(saksnummer) {
    return util.format("/journalpost/%s", saksnummer)
}

function sakSuffix(saksnummer, fagomrade) {
    return util.format("/sak/%s?fagomrade=%s", saksnummer, fagomrade)
}

When('jeg henter journalposter for sak {string} med fagområde {string}', function(saksnummer, fagomrade, done) {
    pathAndParam = sakSuffix(saksnummer, fagomrade)
    console.log("henter journalposter", this.alias, pathAndParam)
    kallFasitRestService(this.alias, pathAndParam)
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
