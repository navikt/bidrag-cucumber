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


Given('restservice {string}', function(alias) {
    this.alias = alias;
});

Then('skal tjenesten returnere {string}', function(body) {
    assert.ok(this.response != null, "response er null")
    var r = this.response.response ? this.response.response : this.response;
    assert.equal(r.data, body, util.format("forventet '%s' fikk '%s'", body, r.data));
})

Then('statuskoden skal være {string}', function(status) {
    assert.ok(this.response != null, "response er null")
    var r = this.response.response ? this.response.response : this.response;
    assert.ok(r.status == status, r.status + " " + r.statusText)
});

Then('objektet skal inneholde følgende verdier', function(data) {
    var expected = JSON.parse(data)
    assert.deepEqual(this.response.data, expected, "Objektene er forskjellige");
})

Then('hver rad i listen skal ha følgende properties satt:', function(table) {
    var missing = [];
    this.response.data.forEach(row => {
        table.rawTable.forEach(item => {
            if (!row[item[0]]) {
                console.log("-- mangler", item[0], "i", row)
                missing.push(item[0])
            }
        })
    })
    assert.ok(missing.length == 0, "Properties mangler: " + missing.join(","))
})

When('jeg kaller status endpoint', function(done) {
    console.log("Kaller /status endpoint")
    this.response = await 
    kallFasitRestService(this.alias, "/status")
        .then(response => {
            this.response = response;
            assert(this.response != null, "Intet svar mottatt fra tjenesten")
            assert(undefined === this.response.errno, "Feilmelding: " + this.response.errno);
            done()
        })
        .catch(err => {
            done(err)
        })
})

