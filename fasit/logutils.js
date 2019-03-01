const { attachText, attachJSON } = require('fasit')

function logResponse(world, response) {
    try {
        attachText(world, `${response.status} ${response.statusText}`)
        if(response.data) {
            if(typeof(response.data) == 'string') {
                attachText(world, response.data)
            } else {
                attachJSON(world, response.data)
            }

        }
    } catch(err) {
        attachText(world, 'logResponse feilet: ' + err)
    }
}

function logError(world, err) {
    try {
        if(err.response) {
            attachText(world, `${err.response.status} ${err.response.statusText}`)
            if(err.response.data) {
                attachText(world, err.response.data)    
            }
        } else {
            attachText(world, `Feil ved oppkobling: ${err.errno}`)
        }
    } catch(err) {
        attachText(world, 'logError feilet: ' + err)
    }
}

module.exports = {
    logError,
    logResponse
}