const assert = require('assert');
const util = require('util');
const {
    When,
    Then
} = require('cucumber');
const {
    httpGet,
    attachJSON
} = require('fasit')

When('jeg ber om tilgang til dokument {string} for en journalpost med id {string}', function(dokref, journalpostId, done) {
    httpGet(this, this.alias, util.format("/tilgang/%s/%s", journalpostId, dokref))
        .then(response => {
            this.response = response
            done()
        })
        .catch(err => {
            done(err)
        })

})

When('jeg ber om tilgang til dokument {string}', function(dokref, done) {
    httpGet(this, this.alias, util.format("/tilgang/%s", dokref))
        .then(response => {
            this.response = response
            done()
        })
        .catch(err => {
            done(err)
        })

})

Then('dokument url skal være gyldig', function() {
    assert(this.response.body != null, 'Null response fra dokument-tilgang')
    var url = this.response.body.dokumentUrl;
    var decodedUrl = decodeURIComponent(url)
    var parsed = new URL(decodedUrl)
    logDecodedURI(this, parsed)
    assert(parsed.protocol == "mbdok:", 'Forventet protocol=mbdok:')
    assert(parsed.username == 'BI12', 'Forventent username=BI12')

})

function logDecodedURI(world, parsed) {
    var value = {}
    for(var f in parsed) {
        if(f != 'toString' && f != 'toJSON') {
            value[f] = parsed[f]
        }
    }
    attachJSON(world, value)
}