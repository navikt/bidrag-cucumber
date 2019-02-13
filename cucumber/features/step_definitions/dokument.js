const assert = require('assert')
const util = require('util')
const { When, Then } = require('cucumber')
const { kallFasitRestService, attachJSON, attachText } = require('fasit')

function journalpostSuffix(saksnummer, fagomrade) {
    return util.format("/sakjournal/%s?fagomrade=%s", saksnummer, fagomrade)
}

When('jeg henter journalposter for sak {string} på fagområdet {string}', function(saksnummer, fagomrade, done) {
    var pathAndParam = journalpostSuffix(saksnummer, fagomrade)
    attachText(this, `Kaller journalposter med ${pathAndParam}`)
    kallFasitRestService(this.alias, pathAndParam)
        .then(response => {
            this.response = response
            assert(this.response != null, "Intet svar mottatt fra tjenesten")
            assert(undefined === this.response.errno, "Feilmelding: " + this.response.errno)
            done()
        })
        .catch(err => {
            done(err)
        })
})

Then('skal resultatet være et journalpost objekt', function() {
    var data = this.response ? this.response.data : null
    assert.ok(data != null, "posten finnes ikke")
    assert.ok(data.jp_id != null, "journalposten mangler påkrevde properties")
})

