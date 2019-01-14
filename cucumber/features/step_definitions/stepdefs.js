const assert = require('assert');
const jwt = require('jsonwebtoken')

const {
    Given,
    When,
    Then
} = require('cucumber');

const {
    httpGet,
    hentToken
} = require('/support/fasit')

When('jeg ber om et token fra {string}', function(env, done) {
    console.log("Henter token for env", env)
    hentToken(env)
        .then(response => {
            this.token = response;
            done()
        })
        .catch(err => {
            this.error = err;
            this.response = null;
            done()
        })
});

Then('skal token være gyldig', function(done) {
    var tok = jwt.decode(this.token)
    console.log(tok)
    assert.ok(tok.tokenName == "id_token", tok)
    done()
});

Then('token skal ha følgende properties:', function(table) {
    var tok = jwt.decode(this.token)
    table.rawTable.forEach(item => {
	var key = item[0]
	var value = item[1]
	console.log("Sjekk", key, value)
	if(!tok[key] || tok[key] != value) {
	    throw "Bad or missing property: " + key;
	}
    }) 
});
