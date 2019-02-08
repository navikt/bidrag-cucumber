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

Given('restservice {string}', function(alias) {
    this.alias = alias;
});

When('jeg kaller status endpoint', function(done) {
    console.log("Kaller /status endpoint");
    kallFasitRestService(this.alias, "/actuator/health")
    .then(response => {
        this.response = response;
	this.attach(`Status: ${response.status} ${response.statusText}`)
	this.attach(`Body: ${JSON.stringify(response.data)}`)
        assert(this.response != null, "Intet svar mottatt fra tjenesten");
        assert(undefined === this.response.errno, "Feilmelding: " + this.response.errno);
        done()
    })
    .catch(err => {
	this.attach("ERROR: " + err)
    	done()
    })
});

When('jeg henter bidragssaker for person med fnr {string}', function(foedselsnummer, done) {
    let pathAndParam = sakSuffix(foedselsnummer);
    this.attach("henter bidragssaker for " + foedselsnummer + ", alias=" + this.alias + ", path=" + pathAndParam);
    kallFasitRestService(this.alias, pathAndParam)
    .then(response => {
        this.response = response;
        assert(this.response != null, "Intet svar mottatt fra tjenesten");
        assert(undefined === this.response.errno, "Feilmelding: " + this.response.errno);
        this.attach("status " + response.status)
        this.attach("bidragsak " + JSON.stringify(response.data))
        done()
    })
    .catch(err => {
	this.attach("ERROR: " + err)
	done()
    })
});

Then('skal tjenesten returnere {string}', function(body) {
    assert.ok(this.response != null, "response er null");
    var r = this.response.response ? this.response.response : this.response;
    assert.equal(r.data, body, util.format("forventet '%s' fikk '%s'", body, r.data));
});


Then('statuskoden skal være {string}', function(status) {
    assert.ok(this.response != null, "response er null");
    var r = this.response.response ? this.response.response : this.response;
    assert.ok(r.status == status, r.status + " " + r.statusText);
});


Then('hver rad i listen skal ha følgende properties satt:', function(table) {
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


