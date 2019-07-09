const assert = require('assert');
const util = require('util');
const {
    When
} = require('cucumber');
const {
    httpPost
} = require('fasit');


When('jeg lager ny journalpost', function (body, done) {
    httpPost(this, this.alias, "/journalpost", JSON.parse(body))
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