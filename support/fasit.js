
const axios = require('axios')

const ENVIRONMENT = process.env.environment || 'q0'
const FASIT_URL = process.env.fasit || 'https://fasit.adeo.no/api/v2/resources'
const FASIT_USER = process.env.fasit_user
const FASIT_PASS = process.env.fasit_pass
const OIDC_ALIAS = process.env.oidc_alias || 'bidrag-dokument-ui-oidc'

function _hentToken() {
    var client_id = null
    var client_secret = null
    var token_endpoint = null

    return hentFasitRessurs('OpenIdConnect', OIDC_ALIAS, ENVIRONMENT)
    .then(response => {
        client_id = response.properties.agentName
        token_endpoint = response.properties.issuerUrl + "/access_token"
        return axios.get(response.secrets.password.ref, {
            auth:{username:FASIT_USER, password: FASIT_PASS}
        })
    }).then(response => {
        client_secret = response.data;
        return axios.post(token_endpoint, 'grant_type=client_credentials&scope=openid', {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            auth: {
                username: client_id,
                password: client_secret
            }
        })
    }).then(response => {
        return response.data.id_token
    }).catch(err => err)
}

function _finnAlias(data, alias) {
    if (data) {
        var res = data.filter(item => {
            return item.alias == alias;
        })
        if (res && res.length == 1) {
            return res[0]
        }
    }
    return null;
}

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
            return _finnAlias(response.data, alias)
        })
        .catch(err => err)
}

function hentFasitRestUrl(alias, env) {
    
    var override = process.env[`${alias.toUpperCase()}_URL`];
    if(override) {
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

function httpGet(alias, env, suffix) {
    var tok = "";
    return _hentToken(alias)
        .then(token => {
            tok = token;
            return hentFasitRestUrl(alias, env)
        })
        .then(url => {
            console.log('httpGet', url + suffix, '[token]', tok)
            return axios.get(url + suffix, {
                headers: {
                    Authorization: 'Bearer ' + tok
                }
            })
        })
        .catch(err => err)
}

module.exports = {
    httpGet,
    hentFasitRessurs,
    hentFasitRestUrl,
    kallFasitRestService
};
