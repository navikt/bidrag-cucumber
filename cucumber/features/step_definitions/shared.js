const assert = require('assert');
const util = require('util');
const { Given, When, Then } = require('cucumber');
const { httpGet, attachText, attachJSON } = require('fasit')

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

/**
 * Sjekker at resultatet matcher en gitt JSON payload
 * 
 */
Then('objektet skal inneholde følgende verdier', function(data) {
    var expected = JSON.parse(data)
    assert.deepEqual(this.response.data, expected, "Objektene er forskjellige");
})

/**
 * Sjekker at hvert element har properties gitt i tabellen. Om tabellen har to kolonner
 * sjekkes det også på verdien av property.
 */
Then('hvert element i listen skal ha følgende properties satt:', function(table) {
    var missing = [];
    this.response.data.forEach(row => {
        table.rawTable.forEach(item => {
            if (!row[item[0]]) {
                missing.push(item[0])
            }
        })
    })
    if(missing.length > 0) {
        attachText(this, "Mangler: " + missing.join(","))
    }
    assert.ok(missing.length == 0, "Properties mangler: " + missing.join(","))
})

/**
 * Kaller actuator/health endpoint 
 */
When('jeg kaller status endpoint', function(done) {
    httpGet(this, this.alias, "/actuator/health")
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

/**
 * Sjekker at http header i response inneholder gitt header/verdi
 * 
 */
Then('header {string} skal være {string}', function (hdr, value) {
    assert(this.response != null, 'Response er null')
    var headerValue = this.response.headers[hdr]
    assert(headerValue != null, `Header ${hdr} er ikke i respons`)
    assert(headerValue == value, `Forventet ${value} fant '${headerValue}'`)
});

/**
 * Sjekk om property i response har gitt verdi
 * 
 */
Then('objektet skal ha {string} = {string}', function (prop, value) {
    assert(this.response != null, 'Response er null')
    assert(this.response.data != null, 'Response mangler data')
    assert(this.response.data[prop] == value, `Forventet '${value}' fant '${this.response.data[prop]}'`)
});
 
/**
 * Sjekk at resultatet er en Array
 * 
 */
Then('skal resultatet være en liste', function() {
    assert.ok(Array.isArray(this.response.data), "resultatet er ikke en liste: " + JSON.stringify(this.list));
});

/**
 * Sjekk hvert element i listen at de har gitt property=verdi.
 * 
 */
Then('hvert element i listen skal ha {string} = {string}', function(prop, feltverdi) {
    assert.ok(this.response != null, "Response er null")
    assert.ok(this.response.data != null, "Response.data er null")
    var arr = this.response.data.filter(jp => jp[prop] == feltverdi)

    assert.ok(arr.length == this.response.data.length, "Det finnes forskjellige saksnummer i listen!")
})


/**
 * Sjekk at resultatet er et object (e.g ikke null eller Array)
 * 
 */
Then('resultatet skal være et objekt', function() {
    assert(this.response != null, 'Response er null')
    assert(this.response.data != null, 'Response mangler data')
    assert.ok(!Array.isArray(this.response.data), "resultatet er en liste")
});

/**
 * 
 * Sjekker om objektet inneholder properties og eventuelt sjekk på verdier
 * om det også er gitt av tabellen (e.g. 2 kolonner istedet for 1)
 * 
 */
Then('objektet skal ha følgende properties:', function(table) {
    var jp = this.response.data;
    var missing = []
    table.rawTable.forEach(item => {
        var value = jp[item[0]]
        if (!value) {
            missing.push(item[0])
        }
        if(item.length > 1) {
            if(value != item[1]) {
                missing.push(item[0])
                attachText(this, `property ${item[0]} har feil verdi: ${value}`)
            }
        }
    })
    assert.equal(missing.length, 0, "Mangler properties: " + missing.join(","));
})


