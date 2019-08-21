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

When('jeg søker etter oppgaver for journalpost', function (done) {
    httpGet(this, 'oppgave.oppgaver', `?journalpostId=${this.journalpostid}&statuskategori=AAPEN`)
        .then(response => {
            this.response = response
            done()
        })
        .catch(err => {
            done(err)
        })
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

When('jeg ber om gyldige avviksvalg for journalpost', function (done) {
    httpGet(this, this.alias, `/journalpost/avvik/${this.journalpostid}`)
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

Then('listen med valg skal inneholde {string}', function(avvikstype) {
  var fantAvvik = false
  this.response.body.forEach(item => {
    if(avvikstype === item) {
      fantAvvik = true
    }
  })

  assert(fantAvvik, `Mangler: ${avvikstype}`)
})

Then('listen med valg skal ikke inneholde {string}', function(avvikstype) {
  var fantAvvik = false
  this.response.body.forEach(item => {
    if(avvikstype == item) {
      fantAvvik = true
    }
  })

  assert(!fantAvvik, `Avvik ikke forventet: ${unexpected}`)
})
