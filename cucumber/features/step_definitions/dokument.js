const assert = require('assert');
const util = require('util');
const {
    When,
    Then
} = require('cucumber');
const {
    httpGet,
    attachJSON,
    hentFasitBaseUrl
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

Then('dokument url skal være gyldig', function(done) {
    assert(this.response.body != null, 'Null response fra dokument-tilgang')
    var url = this.response.body.dokumentUrl;
    var parsed = new URL(url)
    logDecodedURI(this, parsed)

    assert(parsed.protocol == "mbdok:", `Forventet protocol 'mbdok:' fikk '${parsed.protocol}' `)
    assert(parsed.username == 'BI12', `Forventet username 'BI12' fikk ${parsed.username}'`)

    var retServerUrl = parsed.searchParams.get('server')
    hentFasitBaseUrl('brevklientUrl')
        .then(url => {
            assert(retServerUrl == url, `Forventet '${url}' fikk '${retServerUrl}' som brevklient url`)
            done()
        })
        .catch(err => {
            done(err)
        })
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