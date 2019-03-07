const assert = require('assert');
const util = require('util');
const {
    When
} = require('cucumber');
const {
    httpGet
} = require('fasit');

function sakSuffix(foedselsnummer) {
    return util.format("/person/sak/%s", foedselsnummer)
}

When('jeg henter bidragssaker for person med fnr {string}', function (foedselsnummer, done) {
    let pathAndParam = sakSuffix(foedselsnummer);
    httpGet(this, this.alias, pathAndParam)
        .then(response => {
            this.response = response
            assert(this.response != null, "Intet svar mottatt fra tjenesten");
            assert(undefined === this.response.errno, "Feilmelding: " + this.response.errno);
            done()
        })
        .catch(err => {
            done(err)
        })
});