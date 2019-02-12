const assert = require('assert');
const util = require('util');
const {
    Given,
    When,
    Then
} = require('cucumber');

const {
    kallFasitRestService
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


Then('hver journalpost i listen skal ha saksnummer {string} i {string} feltet', function(saksnummer, prop) {
    var arr = this.response.data.filter(jp => jp[prop] == saksnummer);
    assert.ok(arr.length == this.response.data.length, "Det finnes forskjellige saksnummer i listen!")
});

Then('{string} skal være {string}', function(prop, fagomradeString) {
    var arr = this.response.data.filter(jp => jp[prop] == fagomradeString);
    assert.ok(arr.length == this.response.data.length, "Det finnes forskjellige fagområder i listen!")
});

Then('objektet skal inneholde følgende verdier', function(data) {
    var expected = JSON.parse(data)
    assert.deepEqual(this.response.data, expected, "Objektene er forskjellige");
})

Then('journalposten skal ha følgende properties:', function(table) {
    var jp = this.response.data;
    var missing = []
    table.rawTable.forEach(item => {
        if (!jp[item[0]]) {
            missing.push(item[0])
        }
    })
    assert.equal(missing.length, 0, "Mangler properties: " + missing.join(","));
})

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
