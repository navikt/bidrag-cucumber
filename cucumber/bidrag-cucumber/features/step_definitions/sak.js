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

When('jeg henter bidragssaker for person med fnr {string}', async (foedselsnummer) => {
    let pathAndParam = sakSuffix(foedselsnummer);
    console.log("henter bidragssaker for " + foedselsnummer, this.alias, pathAndParam);
    this.response = await kallFasitRestService(this.alias, pathAndParam);
    assert(this.response != null, "Intet svar mottatt fra tjenesten");
    assert(undefined === this.response.errno, "Feilmelding: " + this.response.errno);
});

