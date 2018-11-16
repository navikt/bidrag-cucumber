const axios = require('axios');
const fasitUrl = process.env.fasit || "https://fasit.adeo.no/api/v2/resources";
const environment = process.env.environment || 'q0';

function _hentUrl(data, alias) {
    var url = null
    if (data) {
        var res = data.filter(item => {
            return item.alias == alias;
        })
        if(res && res.properties) {
            url = res.properties.url
            if (url && url.substr(-1) == '/' && url.length > 1) {
                url = url.slice(0, -1);
            }
        }
    }
    return url;
}

function hentFasitRessurs(ftype, alias, env) {
    console.log("hentFasitRessurs", alias, env, fasitUrl)
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
    return hentFasitRessurs('RestService', alias, env)
        .then(response => {
            return _hentUrl(response.data, alias);
        })
        .catch(err => err)
}

function kallFasitRestService(alias, suffix) {
    return hentFasitRestUrl(alias, environment)
        .then(url => {
            console.log("kallFasitRestService", url + suffix)
            return axios.get(url + suffix)
        })
        .catch(err => err)
}

function httpGet(alias, env, suffix) {
    return hentFasitRestUrl(alias, env)
        .then(url => {
            return axios.get(url + suffix)
        })
        .catch(err => err)
}

module.exports = {
    httpGet,
    hentFasitRessurs,
    hentFasitRestUrl,
    kallFasitRestService
};