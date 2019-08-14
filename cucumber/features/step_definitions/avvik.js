const assert = require('assert');
const util = require('util');
const {
	Given,
    When,
	Then
} = require('cucumber');
const {
    httpPost,
    httpPut,
    httpGet
} = require('fasit');

const TESTDATA_ALIAS='bidragDokumentTestdata'

When('jeg endrer journalpost til', function (body, done) {
    httpPut(this, TESTDATA_ALIAS, `/journalpost/${this.journalpostid}`, JSON.parse(body))
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

Given('avvikstype {string}', function(avvikType) {
    this.avvikType = avvikType
})

Given('journalpostID {string}', function(journalpostid) {
    this.journalpostid = journalpostid
})

Given('enhetsnummer {string}', function(enhetsnummer) {
    this.enhetsnummer = enhetsnummer
})

Given('beskrivelse {string}', function(beskrivelse) {
    this.beskrivelse = beskrivelse
})

When('jeg kaller avvik endpoint', function (done) {
    httpPost(this, this.alias, `/journalpost/avvik/${this.journalpostid}`,
			{
				"avvikType": this.avvikType,
				"enhetsnummer": (this.enhetsnummer || "4806"),
				"beskrivelse": this.beskrivelse
			}
		)
        .then(response => {
            this.response = response;
            assert(this.response != null, "Intet svar mottatt fra tjenesten");
            assert(undefined === this.response.errno, "Feilmelding: " + this.response.errno);
            done()
        })
        .catch(err => {
            done(err)
        })
})

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
