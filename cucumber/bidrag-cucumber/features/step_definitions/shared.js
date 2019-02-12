const assert = require('assert');
const util = require('util');
const { Given, When, Then } = require('cucumber');
const { kallFasitRestService } = require('/support/fasit')

/** Felles rutiner for alle tjenester */


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
    kallFasitRestService(this.alias, "/actuator/health")
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

 Then('header {string} skal være {string}', function (hdr, value) {
    assert(this.response != null, 'Response er null')
    var headerValue = this.response.headers[hdr]
    assert(headerValue != null, `Header ${hdr} er ikke i respons`)
    assert(headerValue == value, `Forventet ${value} fant '${headerValue}'`)
 });
 
 Then('skal tjenesten returnere {string} = {string} i payload', function (prop, value) {
    assert(this.response != null, 'Response er null')
    assert(this.response.data != null, 'Response mangler data')
    assert(this.response.data[prop] == value, `Forventet '${value}' fant '${this.response.data[prop]}'`)
 });
 
 Then('skal resultatet være en liste', function() {
    assert.ok(Array.isArray(this.response.data), "resultatet er ikke en liste: " + JSON.stringify(this.list));
});

