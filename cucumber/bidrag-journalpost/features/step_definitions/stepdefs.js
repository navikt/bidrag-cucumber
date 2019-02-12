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

Given('restservice {string}', alias => {
    this.alias = alias;
});

When('jeg henter journalposter for sak {string} med fagområde {string}', async (saksnummer, fagomrade) => {
    pathAndParam = sakSuffix(saksnummer, fagomrade)
    console.log("henter journalposter", this.alias, pathAndParam)
    this.response = await kallFasitRestService(this.alias, pathAndParam)
    assert(this.response != null, "Intet svar mottatt fra tjenesten")
    assert(undefined === this.response.errno, "Feilmelding: " + this.response.errno);
});

When('jeg henter journalpost for id {string}', async journalpostId => {
    this.response = await kallFasitRestService(this.alias, journalpostSuffix(journalpostId))
});

Then('skal tjenesten returnere {string}', body => {
    assert.ok(this.response != null, "response er null")
    var r = this.response.response ? this.response.response : this.response;
    assert.equal(r.data, body, util.format("forventet '%s' fikk '%s'", body, r.data));
})

Then('statuskoden skal være {string}', status => {
    assert.ok(this.response != null, "response er null")
    var r = this.response.response ? this.response.response : this.response;
    assert.ok(r.status == status, r.status + " " + r.statusText)
});

Then('skal resultatet være en liste med journalposter', () => {
    assert.ok(Array.isArray(this.response.data), "resultatet er ikke en liste: " + JSON.stringify(this.list));
});

Then('hver journalpost i listen skal ha saksnummer {string} i {string} feltet', (saksnummer, prop) => {
    var arr = this.response.data.filter(jp => jp[prop] == saksnummer);
    assert.ok(arr.length == this.response.data.length, "Det finnes forskjellige saksnummer i listen!")
});

Then('{string} skal være {string}', (prop, fagomradeString) => {
    var arr = this.response.data.filter(jp => jp[prop] == fagomradeString);
    assert.ok(arr.length == this.response.data.length, "Det finnes forskjellige fagområder i listen!")
});

Then('objektet skal inneholde følgende verdier', (data) => {
    var expected = JSON.parse(data)
    assert.deepEqual(this.response.data, expected, "Objektene er forskjellige");
})

Then('journalposten skal ha følgende properties:', (table) => {
    var jp = this.response.data;
    var missing = []
    table.rawTable.forEach(item => {
        if (!jp[item[0]]) {
            missing.push(item[0])
        }
    })
    assert.equal(missing.length, 0, "Mangler properties: " + missing.join(","));
})

Then('journalposten sitt dokument skal ha følgende properties:', (table) => {
    var jp = this.response.data.dokumenter[0];
    var missing = []
    table.rawTable.forEach(item => {
        if (!jp[item[0]]) {
            missing.push(item[0])
        }
    })
    assert.equal(missing.length, 0, "Mangler properties: " + missing.join(","));
})
