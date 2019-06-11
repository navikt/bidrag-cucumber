const assert = require('assert');
const {
    When,
    Then
} = require('cucumber');
const {
    httpPost,
    attachJSON
} = require('fasit')

When('jeg ber om tilgang til dokument {string} for saksbehandler {string}', function(dokref, saksbehandler, done) {
    httpPost(this, this.alias, '/tilgang/url', {
        dokumentReferanse: dokref,
        saksbehandler: saksbehandler
    })
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
    attachJSON(this, parsed)
    assert(parsed.protocol == "mbdok:", 'Forventet protocol=mbdok:')
    assert(parsed.username == 'BI12', 'Forventent username=BI12')

})