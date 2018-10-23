const axios = require('axios');

// const fasitUrl = process.env.fasit || "http://fasit.adeo.no/api/v2/resources";
const fasitUrl = "http://192.168.65.2:8080/api/v2/resources";


function _hentUrl(data) {
    if(data && data.length > 0) {
        return data[0].properties.url
    }
    console.log("_hentUrl: ingen url funnet i", data)
    return null;
}

function hentFasitRessurs(ftype, alias, env) {
    return axios.get(fasitUrl, {
        params: {
            type: ftype,
            alias: alias,
            environmentclass: env,
            usage: false
        }
    });
}

function hentFasitRestUrl(alias, env) {
    return hentFasitRessurs('RestService', alias, env)
        .then(response => {
            return _hentUrl(response.data);
        })
}


function httpGet(alias, env, suffix) {
    return hentFasitRestUrl(alias, env)
        .then(url => {
            return axios.get(url + suffix)
        })
}

module.exports = {
    httpGet,
    hentFasitRessurs,
    hentFasitRestUrl
};