
const axios = require('axios');
const encodeUrl = require('encodeurl');
const request = require('request');

if (process.env.NODE_ENV == 'dev') {
    require('dotenv').config();
}

const {
    base64encode
} = require('nodejs-base64');

const ENVIRONMENT = process.env.environment || 'q0';
const FASIT_URL = process.env.fasit || 'https://fasit.adeo.no/api/v2/resources';
const TEST_USER_NAME = process.env.TEST_USER_NAME;
const TEST_USER_PASS = process.env.TEST_USER_PASS;
const OIDC_ALIAS = process.env.oidc_alias || 'bidrag-dokument-ui-oidc';

last_oidc_token = "";
last_url = "";

function lastOidcToken() {
    return last_oidc_token;
}

function lastUrl() {
    return last_url;
}

/**
 * Henter et ID_TOKEN basert på opplysninger i fasit for gjeldende miljø.
 * 
 * Det må finnes en 'OpenIdConnect' record for miljøet hvor vi plukker agentName, issuerUrl og password
 */
function hentToken(env) {
    return hentTokenFor(env || ENVIRONMENT, OIDC_ALIAS, TEST_USER_NAME, TEST_USER_PASS)
}

/**
 * Kaller AM for å hente et id_token. Hvis username/password ikke er gitt benyttes "client_credentials".
 * Hvis username/password er gitt benyttes "password" i token request.
 * 
 * @param {String} env Fasit environment
 * @param {String} oidcAlias default bidrag-dokument-ui-oidc
 * @param {String} username Brukernavn for password auth (ikke implementert)
 * @param {String} password Passord for username (ikke implementert)
 */
function hentTokenFor(env, oidcAlias, username, password) {
    var token_endpoint = null;
    var openam_agent_name = null;
    var redirect_uri = null;

    return hentFasitRessurs('RestService', 'bidragDokumentUi', env)
        .then(response => {
            redirect_uri = response.properties.url;
            console.log('redirect_uri encoded: ', encodeUrl(redirect_uri));
            return hentFasitRessurs('OpenIdConnect', oidcAlias, env);
        })                
        .then(response => {
            openam_agent_name = response.properties.agentName;        
            token_endpoint = response.properties.issuerUrl;
               
            console.log('STEP 1 token_endpoint: ', token_endpoint);
            return _oidcStep1Authenticate(token_endpoint, username, password)                 
        })              
        .then(response => {
            console.log('STEP 2, tokenId: ', response.data.tokenId);
            return _oidcStep2Authorize(token_endpoint, response.data.tokenId, openam_agent_name, redirect_uri);                        
        })
        .then(response => {
            var authorizationCode = response.headers.location.code;
            console.log("STEP 3, authorizationCode:", authorizationCode);
           return  _oidcStep3IdToken(token_endpoint, username, password, authorizationCode, redirect_uri);
        })       
        .then(response => {
            last_oidc_token = response.data.id_token
            return response.data.id_token   
        })
        .catch(err => {
            console.log("ERROR - Failed to obtain id-token from OpenAM", err);
            throw err
        })          
    ;
}

/**
 * First step in the process of obtaining id-token for
 * user. Authenticates user with OpenAM. 
 * 
 * Input: User credentials
 * Output: Cookie containing authentication code. Valid for
 * 120s.
 * 
 <code>
 --- Equvivalent CURL-command to obtain tokenId:

   curl --request POST \
  --url 'https://isso-q.adeo.no:443/isso/json/authenticate?authIndexType=service&authIndexValue=ldapservice' \
  --header 'Cache-Control: no-cache' \
  --header 'Content-Type: application/json' \
  --header 'X-OpenAM-Password: #######' \
  --header 'X-OpenAM-Username: z991656' \
  --data '{}'
 
  Sample tokenId output: AQIC5wM2LY4SfczAAXyr-DYjKSsm-nOyZvqGXCJSzgpBs-Y.*AAJTSQACMDIAAlNLABQtMjMxOTU4OTQxNzM0MDQ1MzExNQACUzEAAjA0*

  </code>
 * 
 *
 */
function _oidcStep1Authenticate(token_endpoint, username, password) {

    var url = token_endpoint.replace('oauth2', 'json') + '/authenticate?authIndexType=service&authIndexValue=ldapservice';

    var headers = {
        'Cache-Control': 'no-cache', 
        'Content-Type': 'application/json',
        'X-OpenAM-Password': password,
        'X-OpenAM-Username': username
    }

    return axios.post(url, {}, { headers: headers });
}

/**
 * Second step in obtaining id-token from user.
 * Authorizes user with OpenAM.
 * 
 * Input: Authentication cookie from step 1
 * Output: Authorization code for step 3. Valid for
 * 120s.
 * 
 --- Equvivalent CURL-command to obtain authorization code:
<code>
  curl -X POST \
  https://isso-q.adeo.no/isso/oauth2/authorize \
  -L \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -H 'Cookie: nav-isso=AQIC5wM2LY4SfczAAXyr-DYjKSsm-nOyZvqGXCJSzgpBs-Y.*AAJTSQACMDIAAlNLABQtMjMxOTU4OTQxNzM0MDQ1MzExNQACUzEAAjA0*' \
  -d 'client_id=bidrag-dokument-ui-q0&response_type=code&redirect_uri=https%3A%2F%2Fbidrag-dokument-ui.nais.preprod.local%2F&decision=allow&csrf=AQIC5wM2LY4SfczAAXyr-DYjKSsm-nOyZvqGXCJSzgpBs-Y.*AAJTSQACMDIAAlNLABQtMjMxOTU4OTQxNzM0MDQ1MzExNQACUzEAAjA0*&scope=openid' \
  -i
</code>
  Sample auth code output: YmlkcmFnLWRva3VtZW50LXVpLXEwOkl1aURtTUtzVndCWTRFTWYxUUVPaDY5V3lFeGVGZHdG
 * 
 */
function _oidcStep2Authorize(token_endpoint, tokenId, openam_agent_name, redirect_uri) {    

    /**
     * WIP: Need to obtain location header.
     * 
     */

    var data = {
        client_id: openam_agent_name,
        response_type: 'code',
        //redirect_uri: 'https%3A%2F%2Fbidrag-dokument-ui.nais.preprod.local%2F',
        redirect_uri: redirect_uri,
        decision: 'allow',
        csrf: tokenId,
        scope: 'openid',        
    };

    var headers = {

        'Cache-Control': 'no-cache', 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': 'nav-isso=' + tokenId 
    };

    //return axios.post(token_endpoint + '/authorize', data, {headers: headers});

    /*
    return axios.get(token_endpoint + '/authorize'
        + '?client_id=' + openam_agent_name
        + '&response_type=code'
        + '&redirect_uri: https%3A%2F%2Fbidrag-dokument-ui.nais.preprod.local%2F'
        + '&decision: allow'
        + '& csrf:' +  tokenId
        + '&scope: openid', {headers: headers});     
        
        */

    var options = {
        method: 'POST',
        resolveWithFullResponse: true,
        uri: token_endpoint + '/authorize',
        headers:headers,
        body: JSON.stringify(data)
        //json: true                
    };

    var response =  request(options, function(err, res, body){
        console.log('REQUEST RESULTS: ', err, res.statusCode, body);
    });

    return response;

   //return request(options);
}

/**
 * Third and final step in obtaining id-token from user.
 * 
 * Input:Authorization code from step 2
 * Output: Id-token with 3600s validity.
 * 
 
 --- Equvivalent CURL-command to obtain id-token:
 
 <code>

 curl --request POST \
  --url https://isso-q.adeo.no:443/isso/oauth2/access_token \
  --header 'Authorization: Basic YmlkcmFnLWRva3VtZW50LXVpLXEwOkl1aURtTUtzVndCWTRFTWYxUUVPaDY5V3lFeGVGZHdG' \
  --header 'Cache-Control: no-cache' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data 'grant_type=authorization_code&code=83dd2ac7-505a-4419-aa16-dedcc93c0fa5&redirect_uri=https%3A%2F%2Fbidrag-dokument-ui.nais.preprod.local%2F'
 
  </code>
 */
function _oidcStep3IdToken(token_endpoint, username, password, authorizationCode, redirect_uri) {
    return axios.post(token_endpoint, '/access_token', {
        headers: {
            'Authorization': 'Basic' + toB64(username + ':' + password),
            'Cache-Control': 'no-cache', 
            'Content-Type': 'application/x-www-form-urlencoded'            
        },
        data: {
            grant_type: 'authorization_code',
            code: authorizationCode,
            redirect_uri: encodeUrl(redirect_uri),
        }
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

function kallFasitRestService(alias, suffix) {
    return httpGet(alias, ENVIRONMENT, suffix)
}

/**
 * Finner en URL via oppslag i Fasit og gjør deretter kall til tjenesten med et bearer token.
 * 
 * @param {String} alias 
 * @param {String} env 
 * @param {String} suffix 
 */
function httpGet(alias, env, suffix) {
    var tok = "";
    return hentToken(env)
        .then(token => {
            tok = token;
            return hentFasitRestUrl(alias, env)
        })
        .then(url => {
            console.log('httpGet', url + suffix)
            last_url = url
            return axios.get(url + suffix, {
                headers: {
                    Authorization: 'Bearer ' + tok
                }
            })
        })
        .catch(err => err)
}

/**
 * Finner en URL via oppslag i Fasit og gjør deretter kall til tjenesten med et bearer token.
 * 
 * @param {String} alias 
 * @param {String} suffix 
 * @param {String} body 
 */
function httpPost(alias, suffix, body) {
    return axiosRequest('POST', alias, suffix, body)
}

/**
 * Finner en URL via oppslag i Fasit og gjør deretter kall til tjenesten med et bearer token.
 * 
 * @param {String} alias 
 * @param {String} suffix 
 * @param {String} body 
 */
function httpPut(alias, suffix, body) {
    return axiosRequest('PUT', alias, suffix, body)
}

/**
 * Finner en URL via oppslag i Fasit og gjør deretter kall til tjenesten med et bearer token.
 * 
 * @param {String} alias 
 * @param {String} suffix 
 * @param {String} body 
 */
function axiosRequest(method, alias, suffix, body) {
    var tok = ""
    var env = ENVIRONMENT

    return hentToken(env)
        .then(token => {
            tok = token;
            return hentFasitRestUrl(alias, env)
        })
        .then(url => {
            console.log('httpPost', url + suffix)
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
    hentFasitRessurs,
    hentFasitRestUrl,
    kallFasitRestService,
    toB64,
    attachJSON,
    attachText,
    lastOidcToken,
    lastUrl
};
