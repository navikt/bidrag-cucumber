const axios = require('axios')
const {
    getUserIDToken
} = require('./userid-token')

const {
    base64encode
} = require('nodejs-base64')

const ENVIRONMENT = process.env.environment || 'q0'
const FASIT_URL = process.env.fasit || 'https://fasit.adeo.no/api/v2/resources'
const FASIT_USER = process.env.fasit_user
const FASIT_PASS = process.env.fasit_pass
const OIDC_ALIAS = process.env.oidc_alias || 'bidrag-dokument-ui-oidc'
const TEST_USER = process.env.test_user
const TEST_PASS = process.env.test_pass

/**
 * Siste URL og token brukt
 *
 */
last_oidc_token = ""
last_url = ""

function lastOidcToken() {
    return last_oidc_token
}

function lastUrl() {
    return last_url
}

/**
 * Henter et ID_TOKEN basert på opplysninger i fasit for gjeldende miljø.
 * 
 * Det må finnes en 'OpenIdConnect' record for miljøet hvor vi plukker agentName, issuerUrl og password
 */
function hentToken(env) {
    return hentTokenFor(env || ENVIRONMENT, OIDC_ALIAS, FASIT_USER, FASIT_PASS, TEST_USER, TEST_PASS)
}

/**
 * Kaller AM for å hente et id_token for oidcAlias (client_credentials) eller for bruker (username/password != null).
 * 
 * @param {String} env Fasit environment
 * @param {String} oidcAlias default bidrag-dokument-ui-oidc
 * @param {String} fasitUser  Fasit brukernavn
 * @param {String} fasitPass  Passord for fasit brukernavn
 * @param {String} username Brukernavn for password auth
 * @param {String} password Passord for username
 */
function hentTokenFor(env, oidcAlias, fasitUser, fasitPass, username, password) {
    var client_id = null
    var client_secret = null
    var token_endpoint = null
    var issuerUrl = null

    return hentFasitRessurs('OpenIdConnect', oidcAlias, env)
        .then(response => {
            client_id = response.properties.agentName
            issuerUrl = response.properties.issuerUrl
            token_endpoint = response.properties.issuerUrl + "/access_token"
            return axios.get(response.secrets.password.ref, {
                auth: {
                    username: fasitUser,
                    password: fasitPass
                }
            })
        })
        .then(response => {
            client_secret = response.data;
            if (username && password) {
                return getUserIDToken(issuerUrl, client_id, client_secret, 'https://bidrag-dokument-ui.nais.preprod.local/', username, password)
            } else {
                return axios.post(token_endpoint, 'grant_type=client_credentials&scope=openid', {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    auth: {
                        username: client_id,
                        password: client_secret
                    }
                })
            }
        })
        .then(response => {
            // client_credentials gir response.data mens user/pwd ikke gjør det
            last_oidc_token = response.data ? response.data.id_token : response.id_token
            return last_oidc_token
        })
        .catch(err => {
            console.log("ERROR", err)
            throw err
        })
}

/**
 * Finner alias i en array av fasit ressurser. Fasit gjør substring-search så vi kan få flere treff på en alias
 * til tross for at alias faktisk er unik.
 * 
 * @param {Array} data 
 * @param {String} alias 
 */
function _finnAlias(data, alias, env) {
    if (data) {
        var res = data.filter(item => {
            return item.alias == alias && item.scope && item.scope.environment == env;
        })
        if (res && res.length == 1) {
            return res[0]
        }
    }
    return null;
}

/**
 * Hnenter URL prop fra properties i en fasit restservice record
 * 
 * @param {Restservice} item 
 */
function _hentUrl(item) {
    var url = null
    if (item) {
        url = item.properties.url
        if (url && url.substr(-1) == '/' && url.length > 1) {
            url = url.slice(0, -1);
        }
    }
    return url;
}

/**
 * Søker i Fasit etter ressurser med gitte kriterier
 * 
 * @param {String} ftype 
 * @param {String} alias 
 * @param {String} env 
 */
function hentFasitRessurs(ftype, alias, env) {
    console.log('hentFasitRessurs', alias, env, FASIT_URL)
    return axios.get(FASIT_URL, {
            params: {
                type: ftype,
                alias: alias,
                environment: env,
                usage: false
            },
            timeout: 10000
        })
        .then(response => {
            return _finnAlias(response.data, alias, env)
        })
        .catch(err => {
            console.log("ERROR", err)
        })
}

/**
 * Kaller hentFasitRessurs og _hentUrl for å finne URL til en rest service.
 * 
 * @param {String} alias 
 * @param {String} env 
 */
function hentFasitRestUrl(alias, env) {

    var override = process.env[`${alias.toUpperCase()}_URL`];
    if (override) {
        return new Promise((resolve, reject) => {
            resolve(override)
        })
    }

    return hentFasitRessurs('RestService', alias, env)
        .then(response => {
            return _hentUrl(response);
        })
        .catch(err => err)
}

/**
 * Finner en URL via oppslag i Fasit og gjør deretter kall til tjenesten med et bearer token.
 * 
 * @param {String} alias 
 * @param {String} env 
 * @param {String} suffix 
 */
function httpGet(world, alias, suffix) {
    return axiosRequest(world, 'GET', alias, suffix, null)
}

/**
 * Finner en URL via oppslag i Fasit og gjør deretter kall til tjenesten med et bearer token.
 * 
 * @param {String} alias 
 * @param {String} suffix 
 * @param {String} body 
 */
function httpPost(world, alias, suffix, body) {
    return axiosRequest(world, 'POST', alias, suffix, body)
}

/**
 * Finner en URL via oppslag i Fasit og gjør deretter kall til tjenesten med et bearer token.
 * 
 * @param {String} alias 
 * @param {String} suffix 
 * @param {String} body 
 */
function httpPut(world, alias, suffix, body) {
    return axiosRequest(world, 'PUT', alias, suffix, body)
}

/**
 * Finner en URL via oppslag i Fasit og gjør deretter kall til tjenesten med et bearer token.
 * 
 * @param {String} alias 
 * @param {String} suffix 
 * @param {String} body 
 */
function axiosRequest(world, method, alias, suffix, body) {
    var tok = ""
    var env = ENVIRONMENT

    return hentToken(env)
        .then(token => {
            tok = token;
            return hentFasitRestUrl(alias, env)
        })
        .then(url => {
            attachText(world, `${method} ${url}${suffix}`)
            if(body && typeof body == "object") { // null and undefined -> 'object'
                attachJSON(world, body)
            } else if(typeof body == "string") {
                attachText(world, body)
            }
            last_url = url

            return axios.request({
                url: url + suffix,
                method: method,
                data: body,
                proxy: false,
                headers: {
                    "Authorization": `Bearer ${tok}`,
                    "Content-Type": "application/json"
                }
            })
        }).then(response => {
            // placeholder code for mer logging
            return response
        })
        .catch(err => err)
}

/**
 * Cucumber report forventer base64 encoded data i attachments/embeddings
 * 
 * @param {String} str 
 */
function toB64(str) {
    return base64encode(str);
}

/**
 * Legg ved JSON payload til cucumber embeddings
 * 
 * @param {Object} world 
 * @param {JSONObject} json 
 */
function attachJSON(world, json) {
    try {
        attachText(world, JSON.stringify(json, null, 4))
    } catch (e) {
        attachText('attachJSON: ' + e)
    }
}

/**
 * Legg ved text til cucumber embeddings
 * 
 * @param {Object} world 
 * @param {String} text
 */
function attachText(world, text) {
    world.attach(toB64(text))
}


module.exports = {
    hentToken,
    hentTokenFor,
    httpGet,
    httpPost,
    httpPut,
    hentFasitRessurs,
    hentFasitRestUrl,
    toB64,
    attachJSON,
    attachText,
    lastOidcToken,
    lastUrl,
    OIDC_ALIAS
};
