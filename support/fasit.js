const axios = require('axios');
const fasitUrl = process.env.fasit || 'https://fasit.adeo.no/api/v2/resources';
const environment = process.env.environment || 'q0';
const token = process.env.OIDC_TOKEN;

function _hentToken() {

    if(token) {
        console.log('bruker OIDC_TOKEN fra env var', token);
        return new Promise((resolve, reject) => {
            resolve(token)
        })
    }

    var url = process.env.OIDC_URL || 'https://isso-q.adeo.no:443/isso/oauth2/access_token';
    var client_id = process.env.OIDC_CLIENT_ID;
    var client_secret = process.env.OIDC_CLIENT_SECRET;

    if(!client_id || !client_secret) {
        console.log('Mangler OIDC_CLIENT_ID og/eller OIDC_CLIENT_SECRET - bruker dummy-token')
        return new Promise((resolve, reject) => {
            resolve('dummy-token')
        })
    }

    return axios.post(url,
            'grant_type=client_credentials&scope=openid', {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                auth: {
                    username: client_id,
                    password: client_secret
                }
            })
        .then(response => {
            console.log('bruker client_credentials access token', response.data)
            return response.data.access_token
        })
        .catch(err => err)
}

function _hentUrl(data, alias) {
    var url = null
    if (data) {
        var res = data.filter(item => {
            return item.alias == alias;
        })
        if (res && res.length == 1) {
            url = res[0].properties.url
            if (url && url.substr(-1) == '/' && url.length > 1) {
                url = url.slice(0, -1);
            }
        }
    }
    return url;
}

function hentFasitRessurs(ftype, alias, env) {
    console.log('hentFasitRessurs', alias, env, fasitUrl)
    return axios.get(fasitUrl, {
            params: {
                type: ftype,
                alias: alias,
                environment: env,
                usage: false
            },
            timeout: 10000
        })
        .then(response => response)
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
            return _hentUrl(response.data, alias);
        })
        .catch(err => err)
}

function kallFasitRestService(alias, suffix) {
    return httpGet(alias, environment, suffix)
}

function httpGet(alias, env, suffix) {
    var tok = "";
    return _hentToken(alias)
        .then(token => {
            tok = token;
            return hentFasitRestUrl(alias, env)
        })
        .then(url => {
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