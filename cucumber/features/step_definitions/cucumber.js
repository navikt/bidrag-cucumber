const assert = require('assert');
const jwt = require('jsonwebtoken')
const {
    When,
    Then
} = require('cucumber');
const {
    OIDC_ALIAS,
    hentTokenFor,
    attachText,
    attachJSON
} = require('fasit')

/**
 * 
 */
When('jeg ber om et token fra {string}', function (env, done) {
    hentTokenFor(env, OIDC_ALIAS, process.env.fasit_user, process.env.fasit_pass, null, null)
        .then(response => {
            this.token = response;
            this.tokenJwt = jwt.decode(this.token)
            attachJSON(this, this.tokenJwt)
            done()
        })
        .catch(err => {
            attachText("ERROR: " + err)
            this.error = err;
            this.response = null;
            done(err)
        })
});

/**
 * 
 */
When('jeg ber om et bruker-token fra {string}', function (env, done) {
    hentTokenFor(env, OIDC_ALIAS, process.env.fasit_user, process.env.fasit_pass, process.env.test_user, process.env.test_pass)
        .then(response => {
            this.token = response;
            this.tokenJwt = jwt.decode(this.token)
            attachJSON(this, this.tokenJwt)
            done()
        })
        .catch(err => {
            attachText("ERROR: " + err)
            this.error = err;
            this.response = null;
            done(err)
        })
});

Then('skal token være gyldig', function () {
    var tok = this.tokenJwt
    assert.ok(tok.tokenName == "id_token", tok)
});

Then('token skal ha følgende properties:', function (table) {
    var tok = this.tokenJwt
    table.rawTable.forEach(item => {
        var key = item[0]
        var value = item[1]
        if (value.startsWith('$')) {
            value = eval(value.substring(1))
        }
        if (!tok[key] || tok[key] != value) {
            throw "Bad or missing property: " + key;
        }
    })
});