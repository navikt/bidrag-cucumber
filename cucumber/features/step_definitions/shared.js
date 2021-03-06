const assert = require('assert');
const util = require('util');
const uniqid = require('uniqid')
const {
    Given,
    When,
    Then,
    Before,
    setDefaultTimeout
} = require('cucumber');
const {
    httpGet,
    attachText,
    attachJSON,
    lastOidcToken
} = require('fasit')
const jwt = require('jsonwebtoken')

/**
 * Endre default timeout for alle test caser
 */
setDefaultTimeout(60 * 1000)

/** Correlation ID og logging */
Before(function(testCase) {
    this.correlationId = `cucumber-${uniqid()}`
    var url = `https://logs.adeo.no/app/kibana#/discover?_g=()&_a=(columns:!(message,envclass,environment,level,application,host),index:'96e648c0-980a-11e9-830a-e17bbd64b4db',interval:auto,query:(language:lucene,query:"${this.correlationId}"),sort:!('@timestamp',desc))`
    attachText(this, `Link til kibana for correlation-id: ${this.correlationId}\n\n` + url + "\n")
    this.innloggetEnhetsnummer = process.env.ENHETSNUMMER || '4806'
})

/** Felles rutiner for alle tjenester */

Given('restservice {string}', function (alias) {
    this.alias = alias
});

Given('innlogget enhet {string}', function(innloggetEnhetsnummer) {
    this.innloggetEnhetsnummer = innloggetEnhetsnummer
})

Given('response er', function(body) {
    this.response = {}
    this.response.body = JSON.parse(body)
})

/**
 * Overstyrer fasit environment som benyttes i fasit modulen (-> fasit/index.js)
 */
Given('fasit environment {string}', function(env) {
    this.environment = env
})

Given('En correlation-id med prefix {string}', function (prefix) {
    this.correlationId = prefix + Math.random()
});

Then('skal tjenesten returnere {string}', function (body) {
    assert.ok(this.response != null, "response er null")
    var r = this.response.response ? this.response.response : this.response;
    assert.equal(r.data, body, util.format("forventet '%s' fikk '%s'", body, r.data));
})

Then('statuskoden skal være {string}', function (status) {
    assert.ok(this.response != null, "response er null")
    var r = this.response.response ? this.response.response : this.response;
    if (r.statusCode == '401' || r.statusCode == '403') {
        attachText(this, "ID_TOKEN: " + lastOidcToken())
        try {
            var token = jwt.decode(lastOidcToken())
            if (token) {
                attachJSON(this, token)
            }
        } catch (err) {}
    }
    assert.ok(r.statusCode == status, r.statusCode + " " + r.statusMessage)
});

/**
 * Sjekker at resultatet matcher en gitt JSON payload
 * 
 */
Then('objektet skal inneholde følgende verdier', function (data) {
    var expected = JSON.parse(data)
    assert.deepEqual(this.response.body, expected, "Objektene er forskjellige");
})

/**
 * Sjekker at hvert element har properties gitt i tabellen. Om tabellen har to kolonner
 * sjekkes det også på verdien av property.
 */
Then('hvert element i listen skal ha følgende properties satt:', function (table) {
    var missing = [];
    this.response.body.forEach(row => {
        table.rawTable.forEach(item => {
            if (!row.hasOwnProperty(item[0])) {
                missing.push(item[0])
            }
        })
    })
    if (missing.length > 0) {
        attachText(this, "Mangler: " + missing.join(","))
    }
    assert.ok(missing.length == 0, "Properties mangler: " + missing.join(","))
})

/**
 * Kaller actuator/health endpoint 
 */
When('jeg kaller status endpoint', function (done) {
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
    assert(this.response.body != null, 'Response mangler body')
    assert(this.response.body[prop] == value, `Forventet '${value}' fant '${this.response.body[prop]}'`)
});

/**
 * Sjekk at resultatet er en Array
 * 
 */
Then('skal resultatet være en liste', function () {
    assert.ok(Array.isArray(this.response.body), "resultatet er ikke en liste: " + JSON.stringify(this.list));
});

/**
 * Sjekk hvert element i listen at de har gitt property=verdi.
 * 
 */
Then('hvert element i listen skal ha {string} = {string}', function (prop, feltverdi) {
    assert.ok(this.response != null, "Response er null")
    assert.ok(this.response.body != null, "Response.data er null")
    var arr = this.response.body.filter(jp => jp[prop] == feltverdi)

    assert.ok(arr.length == this.response.body.length, "Det finnes forskjellige saksnummer i listen!")
})


/**
 * Sjekk at resultatet er et object (e.g ikke null eller Array)
 * 
 */
Then('resultatet skal være et objekt', function () {
    assert(this.response != null, 'Response er null')
    assert(this.response.body != null, 'Response mangler data')
    assert.ok(!Array.isArray(this.response.body), "resultatet er en liste")
});

/**
 * 
 * Sjekker om objektet inneholder properties og eventuelt sjekk på verdier
 * om det også er gitt av tabellen (e.g. 2 kolonner istedet for 1)
 * 
 */
Then('objektet skal ha følgende properties:', function (table) {
    verifyContents(this, table, this.response.body, 'response')
})

Then('{string} skal ha følgende properties:', function (prop, table) {
    verifyContents(this, table, this.response.body[prop], prop)
})

Then('{string} i hvert element skal ha følgende properties:', function (prop, table) {
    var world = this
    this.response.body.forEach(item => {
        verifyContents(world, table, item[prop], prop)
    })
})

function verifyContents(world, table, jp, source) {
    var missing = []
    if(Array.isArray(jp)) {
        if(jp.length == 0) {
            missing.push(`Input array er tom: ${source}`)
        }
        jp.forEach(item => {
            missing = missing.concat( _verifyContent(world, table, item) )
        })
    } else if (jp == null || jp == undefined) {
        missing.push(`Input objekt er null: ${source}`)
    } else {
        missing = _verifyContent(world, table, jp)
    }
    assert.equal(missing.length, 0, "Mangler properties: " + missing.join(","));
}

function _verifyContent(world, table, jp) {
    var missing = []
    table.rawTable.forEach(item => {
        var value = jp[item[0]]
        if (value == undefined) {
            missing.push(item[0])
        }
        if (item.length > 1) {
            if (item[1] && value != item[1]) {
                missing.push(item[0])
                world.attachText(this, `property ${item[0]} har feil verdi: ${value}`)
            }
        }
    })
    return missing
}

Given('journalpostfil {string}', function(file) {
    this.nyJournalpostFile = file
})

Then('sett {string} til journalpost.{string}', function(prop, src) {
    var value = this.nyJournalpost[src]
    if (value && src == 'journalpostId') {
        value = value.replace('BID-', '')
        value = value.replace('JOARK-', '')
    }
    this[prop] = value
    console.log(prop, value)
})
