const assert = require('assert');
const util = require('util');
const {
    Given,
    When,
    Then
} = require('cucumber');

const {
    kallFasitRestService
} = require('/support/fasit');

function sakSuffix(foedselsnummer) {
    return util.format("/person/sak/%s", foedselsnummer)
}

Given('restservice {string}', alias => {
    this.alias = alias;
});

When('jeg kaller status endpoint', function(done) {
    console.log("Kaller /status endpoint");
    kallFasitRestService(this.alias, "/status")
    .then(response => {
        this.response = response;
        assert(this.response != null, "Intet svar mottatt fra tjenesten");
        assert(undefined === this.response.errno, "Feilmelding: " + this.response.errno);
        done()
    })
    .catch(err => err);
});

When('jeg henter bidragssaker for person med fnr {string}', function(foedselsnummer, done) {
    let pathAndParam = sakSuffix(foedselsnummer);
    console.log("henter bidragssaker for " + foedselsnummer, this.alias, pathAndParam);
    kallFasitRestService(this.alias, pathAndParam)
    .then(response => {
        this.response = response;
        assert(this.response != null, "Intet svar mottatt fra tjenesten");
        assert(undefined === this.response.errno, "Feilmelding: " + this.response.errno);
        done()
    })
    .catch(err => err);
});

Then('skal tjenesten returnere {string}', body => {
    assert.ok(this.response != null, "response er null");
    var r = this.response.response ? this.response.response : this.response;
    assert.equal(r.data, body, util.format("forventet '%s' fikk '%s'", body, r.data));
});


Then('statuskoden skal være {string}', status => {
    assert.ok(this.response != null, "response er null");
    var r = this.response.response ? this.response.response : this.response;
    assert.ok(r.status === status, r.status + " " + r.statusText);
});


Then('hver rad i listen skal ha følgende properties satt:', (table) => {
    var missing = [];

    this.response.data.forEach(row => {
        table.rawTable.forEach(item => {
            if (!row[item[0]]) {
                console.log("-- mangler", item[0], "i", row)
                missing.push(item[0])
            }
        })
    });

    assert.ok(missing.length === 0, "Properties mangler: " + missing.join(","))
});
