const assert = require('assert');
const util = require('util');
const {
    When
} = require('cucumber');
const {
    httpGet,
    httpPost,
    httpPostLocal
} = require('fasit');

let jsonData = {avvikType:"BESTILL_ORIGINAL",enhetsnummer:"4806"};

let jsonDataToSend = { "avvikType": "BESTILL_ORIGINAL",  "enhetsnummer":"30"};
let json = {
    "avvikType": "BESTILL_ORIGINAL",
    "enhetsnummer": "30"
};
When('jeg kaller bestill original endpoint med journalpostID {string}', function (journalpostid, done) {
    let tokena = "eyJraWQiOiJsb2NhbGhvc3Qtc2lnbmVyIiwidHlwIjoiSldUIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiIxMjM0NTY3ODkxMCIsImF1ZCI6ImF1ZC1sb2NhbGhvc3QiLCJhY3IiOiJMZXZlbDQiLCJ2ZXIiOiIxLjAiLCJuYmYiOjE1NjM5NTA3NzYsImF1dGhfdGltZSI6MTU2Mzk1MDc3NiwiaXNzIjoiaXNzLWxvY2FsaG9zdCIsImV4cCI6MjM0MTU1MDc3Niwibm9uY2UiOiJteU5vbmNlIiwiaWF0IjoxNTYzOTUwNzc2LCJqdGkiOiIyNDEwYTRhNS0xNzg4LTQwZDAtOWJhOS0xZWMwOWU1ZTBmMWUifQ.GxKlWxW0__JRWd4Dai_olrG1XNWbZd_BB0Sshsh-NUoukTmtGiPml6Z9F1XlHgRwI1nKEPe2nZhOQ5ZHLw6RnJTj-K4IQAtpwrG30fI3xog8IO9WodNTarlk2WlOgEm_CwpLjJ3F6wWt0mRUOT0mA-NR2c7o_9wVxtjBwVa6K0H88bAK4-8MaNEi1mjsIA7LoPpuWCJ8yWQC-d79mpq03sFarfE5jwyv7gyL017B_C6dpIVqlj_WbWFViJ5fmeecZ4jUF-fySusExsNZdMVNA5OiW0aNRdjuFuAKTTD1BRiqeiZfVLfDSrR2QyJjjZStSrAZvLD8TJBeglkTydIggw";
    httpPostLocal('http://localhost:8080/bidrag-dokument-journalpost/journalpost/avvik/37306665',tokena,JSON.stringify(json))
        .then(response => {
            this.response = response;
            assert(this.response != null, "Intet svar mottatt fra tjenesten");
            assert(undefined === this.response.errno, "Feilmelding: " + this.response.errno);
            done()
        })
        .catch(err => {
            done(err)
        });
    /*httpPost(this, this.alias, `/journalpost/avvik/${journalpostid}`,JSON.stringify(json))
        .then(response => {
            this.response = response;
            assert(this.response != null, "Intet svar mottatt fra tjenesten");
            assert(undefined === this.response.errno, "Feilmelding: " + this.response.errno);
            done()
        })
        .catch(err => {
            done(err)
        })*/
});
