const assert = require('assert');
const util = require('util');
const {
  When,
  Given,
  Then
} = require('cucumber');
const {
  httpPost
} = require('fasit');
const fs = require('fs')
const {
  attachJSON,
  attachText
} = require('fasit');

Then('les eller opprett journalpost med journalpost-api', function(body, done) {
  if (fs.existsSync(this.nyJournalpostFile)) {
    this.nyJournalpost = JSON.parse(fs.readFileSync(this.nyJournalpostFile,'utf-8'))
    this.response = {
      statusCode: '201',
      data: this.nyJournalpost
    }
    done()
  } else {
    httpPost(this, 'journalpostV1', "/rest/journalpostapi/v1/journalpost", JSON.parse(body))
    .then(response => {
      this.response = response
      assert(this.response != null, "Intet svar mottatt fra tjenesten");
    assert(undefined === this.response.errno, "Feilmelding: " + this.response.errno);
    this.nyJournalpost = response.body
    fs.writeFileSync(this.nyJournalpostFile, JSON.stringify(this.nyJournalpost))
    this.response = {
      statusCode: '201',
      data: this.nyJournalpost
    }
    done()
  })
  .catch(err => {
      done(err)
    })
  }
});

