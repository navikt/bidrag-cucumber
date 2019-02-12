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

function journalpostSuffix(saksnummer, fagomrade) {
    return util.format("/sakjournal/%s?fagomrade=%s", saksnummer, fagomrade)
}

When('jeg henter journalposter for sak {string} på fagområdet {string}', function(saksnummer, fagomrade, done) {
    pathAndParam = journalpostSuffix(saksnummer, fagomrade)
    console.log("henter journalposter", saksnummer, this.alias, pathAndParam)
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

Then('skal resultatet være et journalpost objekt', function() {
    var data = this.response ? this.response.data : null;
    assert.ok(data != null, "posten finnes ikke");
    assert.ok(data.jp_id != null, "journalposten mangler påkrevde properties");
});

Then('hver journalpost i listen skal ha {string} {string}', function(prop, feltverdi) {
    console.log('hver journalpost i listen', this.response)
    assert.ok(this.response != null, "Response er null")
    this.attach(JSON.stringify(this.response), "application/json")
    assert.ok(this.response.data != null, "Response.data er null")
    var arr = this.response.data.filter(jp => jp[prop] == feltverdi);
    assert.ok(arr.length == this.response.data.length, "Det finnes forskjellige saksnummer i listen!")
});

