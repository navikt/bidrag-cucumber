const assert = require('assert');
const util = require('util');
const {
    When,
	Then
} = require('cucumber');
const {
    httpPost,
    httpGet
} = require('fasit');

When('jeg kaller bestill original endpoint med journalpostID {string}', function (journalpostid, done) {
    httpPost(this, this.alias, `/journalpost/avvik/${journalpostid}`,{"avvikType":"BESTILL_ORIGINAL", "enhetsnummer":"4806" })
        .then(response => {
            this.response = response;
            assert(this.response != null, "Intet svar mottatt fra tjenesten");
            assert(undefined === this.response.errno, "Feilmelding: " + this.response.errno);
            done()
        })
        .catch(err => {
            done(err)
        })
});

When('jeg kaller bestill reskanning endpoint med journalpostID {string}', function (journalpostid, done) {
    httpPost(this, this.alias, `/journalpost/avvik/${journalpostid}`,{"avvikType":"BESTILL_RESKANNING", "enhetsnummer":"4806" })
        .then(response => {
            this.response = response;
            assert(this.response != null, "Intet svar mottatt fra tjenesten");
            assert(undefined === this.response.errno, "Feilmelding: " + this.response.errno);
            done()
        })
        .catch(err => {
            done(err)
        })
});

When('jeg kaller bestill endpoint med avvik {string} og journalpostID {string}', function(avvikType,journalpostid,done){
    httpPost(this, this.alias, `/journalpost/avvik/${journalpostid}`,{"avvikType":avvikType, "enhetsnummer":"4806" })
        .then(response => {
            this.response = response;
            assert(this.response != null, "Intet svar mottatt fra tjenesten");
            assert(undefined === this.response.errno, "Feilmelding: " + this.response.errno);
            done()
        })
        .catch(err => {
            done(err)
        })
});

When('jeg ber om avviksvalg for journalpostID {string}', function (journalpostid, done) {
    httpGet(this, this.alias, `/journalpost/avvik/${journalpostid}`)
        .then(response => {
            this.response = response;
            assert(this.response != null, "Intet svar mottatt fra tjenesten");
            assert(undefined === this.response.errno, "Feilmelding: " + this.response.errno);
			console.log(this.response.body)
            done()
        })
        .catch(err => {
            done(err)
        })
});

Then('listen med valg skal kun inneholde:', function(table) {
    var missing = []
    var unexpected = []
    table.rawTable.forEach(item => {
		if (!this.response.body.find(elem => elem == item[0])) {
			missing.push(item)
		}
    })
	this.response.body.forEach(item => {
		if(!table.rawTable.find(elem => elem[0] == item)) {
			unexpected.push(item)
		}
	})
	assert(missing.length == 0 && unexpected.length == 0, `Mangler: ${missing}, Uventet: ${unexpected}`)
})
