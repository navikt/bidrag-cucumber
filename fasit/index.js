const request = require('request-promise')
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
const FASIT_ZONE = process.env.fasit_zone || "fss"
const OIDC_ALIAS = process.env.oidc_alias || 'bidrag-dokument-ui-oidc'
const TEST_USER = process.env.test_user
const TEST_PASS = process.env.test_pass
const CORRELATION_HEADER = process.env.correlation_header || "X-Correlation-ID"
const REDIRECT_URI = process.env.redirect_uri || "https://bidrag-dokument-ui.nais.preprod.local/isso"

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
            return request({
                method: 'GET',
                url: response.secrets.password.ref,
                auth: {
                    username: fasitUser,
                    password: fasitPass
                },
                resolveWithFullResponse: true
            })
        })
        .then(response => {
            client_secret = response.body;
            if (username && password) {
                return getUserIDToken(issuerUrl, client_id, client_secret, REDIRECT_URI, username, password)
            } else {
                return request({
                    method: 'POST',
                    url: token_endpoint,
                    body: 'grant_type=client_credentials&scope=openid',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    auth: {
                        username: client_id,
                        password: client_secret
                    },
                    json: true,
                    resolveWithFullResponse: true
                })
            }
        })
        .then(response => {
            // client_credentials gir response.data mens user/pwd ikke gjør det
            last_oidc_token = response.body ? response.body.id_token : response.id_token
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
    return request({
            method: 'GET',
            url: FASIT_URL,
            qs: {
                type: ftype,
                alias: alias,
                environment: env,
                zone: FASIT_ZONE,
                usage: false
            },
            json: true,
            resolveWithFullResponse: true
        })
        .then(response => {
            return _finnAlias(response.body, alias, env)
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
 * Finner en URL via oppslag i Fasit og gjør deretter GET kall til tjenesten med et bearer token.
 * 
 * @param {String} alias 
 * @param {String} env 
 * @param {String} suffix 
 */
function httpGet(world, alias, suffix) {
    return sendRequest(world, 'GET', alias, suffix, null)
}

/**
 * Finner en URL via oppslag i Fasit og gjør deretter DELETE kall til tjenesten med et bearer token.
 * 
 * @param {String} alias 
 * @param {String} env 
 * @param {String} suffix 
 */
function httpDelete(world, alias, suffix) {
    return sendRequest(world, 'DELETE', alias, suffix, null)
}

/**
 * Finner en URL via oppslag i Fasit og gjør deretter POST kall til tjenesten med et bearer token.
 * 
 * @param {String} alias 
 * @param {String} suffix 
 * @param {String} body 
 */
function httpPost(world, alias, suffix, body) {
    return sendRequest(world, 'POST', alias, suffix, body)
}

/**
 * Finner en URL via oppslag i Fasit og gjør deretter PUT kall til tjenesten med et bearer token.
 * 
 * @param {String} alias 
 * @param {String} suffix 
 * @param {String} body 
 */
function httpPut(world, alias, suffix, body) {
    return sendRequest(world, 'PUT', alias, suffix, body)
}

/**
 * Finner en URL via oppslag i Fasit og gjør deretter kall til tjenesten med et bearer token.
 * 
 * @param {String} alias 
 * @param {String} suffix 
 * @param {String} body 
 */
function sendRequest(world, method, alias, suffix, body) {
    var tok = ""
    var env = world.environment || ENVIRONMENT

    return hentToken(env)
        .then(token => {
            tok = token;
            return hentFasitRestUrl(alias, env)
        })
        .then(url => {
            last_url = url

            var options = {
                url: url + suffix,
                method: method,
                proxy: false,
                headers: {
                    "Authorization": `Bearer ${tok}`,
                    "Content-Type": "application/json"
                },
                resolveWithFullResponse: true,
                json: true,
		timeout: 20 * 1000
            }
            if (body) {
                options.body = body
            }
            if(world.correlationId) {
                options.headers[CORRELATION_HEADER] = world.correlationId
            }
            return request(options)
        }).then(response => {
            logResponse(world, response, method, last_url + suffix, body)
            return response
        })
        .catch(err => {
            logError(world, err, method, last_url + suffix, body)
            if (err && err.statusCode == 401) {
                attachText(world, `Token: ${tok}`)
            }
            return err
        })
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

/**
 * Legg ved relevant info fra response objekt
 * 
 * @param {Object} world 
 * @param {Object} response 
 */
function logResponse(world, response, method, url, body, headers) {
    try {
        
        logMessageAndBodyString(world, method, url, body)
        logMessageAndBodyString(world, response.statusCode, response.statusMessage, response.body)
    } catch (error) {
        attachText(world, 'logResponse feilet: ' + error + "; " + err)
    }
}
/**
 * Legg ved relevant info fra error objekt
 * 
 * @param {Object} world 
 * @param {Object} err 
 */
function logError(world, err, method, url, body) {
    try {
        logMessageAndBodyString(world, method, url, body)
        if (err) {
            logMessageAndBodyString(world, err.statusCode, err.error ? err.error.error : err.statusMessage, err.response.body)
        } else {
            attachText(world, `Feil ved oppkobling: ${err.errno}`)
        }
    } catch (error) {
        attachText(world, 'logError feilet: ' + error + "; " + err)
    }
}

function logMessageAndBodyString(world, p1, p2, body) {
    try {
        var msg = []
        msg.push(`${p1} ${p2}`)
        if (body) {
            if (body && typeof body == "object") { // null and undefined -> 'object'
                msg.push(JSON.stringify(body, null, 4))
            } else if (typeof body == "string") {
                msg.push(body)
            }
        }
        attachText(world, msg.join('\n'))
    } catch (err) {
        attachText(world, 'logMessageAndBodyString failed ' + err);
    }
}

module.exports = {
    hentToken,
    hentTokenFor,
    httpDelete,
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
