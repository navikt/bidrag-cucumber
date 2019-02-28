const request = require('request-promise')
const urlparser = require('url')

callParams = {}

function auth1Options(tokenEndpoint, username, password) {
	var url = tokenEndpoint.replace('oauth2', 'json')
	callParams.options1 = {
		method: 'POST',
		uri: `${url}/authenticate?authIndexType=service&authIndexValue=ldapservice`,
		headers: {
			'Cache-Control': 'no-cache',
			'Content-Type': 'application/json',
			'X-OpenAM-Username': username,
			'X-OpenAM-Password': password
		},
		json: true,
		body: '{}'
	}
	return callParams.options1
}

function auth2Options(tokenEndpoint, agentName, tokenId, redirectUri) {
	callParams.options2 = {
		method: 'POST',
		uri: `${tokenEndpoint}/authorize`,
		headers: {
			'Cache-Control': 'no-cache',
			'Content-Type': 'application/x-www-form-urlencoded',
			'Cookie': `nav-isso=${tokenId}`
		},
		qs: {
			client_id: agentName,
			response_type: 'code',
			redirect_uri: redirectUri,
			decision: 'allow',
			scope: 'openid',
			csrf: tokenId
		},
		json: true,
		simple: false,
		resolveWithFullResponse: true
	}
	return callParams.options2
}

function auth3Options(tokenEndpoint, agentName, agentSecret, authCode, redirectUri) {
	callParams.options3 = {
		method: 'POST',
		uri: `${tokenEndpoint}/access_token`,
		auth: {
			'user': agentName,
			'pass': agentSecret
		},
		headers: {
			'Cache-Control': 'no-cache',
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		qs: {
			grant_type: 'authorization_code',
			redirect_uri: redirectUri,
			code: authCode
		}
	}
	return callParams.options3
}

function getCodeFromHeader(loc) {
	return urlparser.parse(loc, true).query.code
}

function getUserIDToken(token_endpoint, client_id, client_secret, redirect_uri, username, password) {
	var tokenId = null
	return request(auth1Options(token_endpoint, username, password))
		.then(response => {
			tokenId = response.tokenId
			return request(auth2Options(token_endpoint, client_id, tokenId, redirect_uri))
		})
		.then(response => {
			if (response && response.statusCode == 302) {
				var code = getCodeFromHeader(response.headers.location)
				return request(auth3Options(token_endpoint, client_id, client_secret, code, redirect_uri))
			} else {
				throw "Expected 302 got " + response.statusCode
			}
		})
		.catch(err => {
			console.log("ERROR GETTING TOKEN", err.statusCode)
			console.log()
			for (var key in callParams) {
				console.log(key, callParams[key])
			}
			throw err
		})
}

module.exports = {
	getUserIDToken
}