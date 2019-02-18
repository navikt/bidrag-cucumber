
const {lastUrl, lastOidcToken, attachText, attachJSON } = require('fasit')

function handleError(world, error) {
    console.log("Last URL called", lastUrl())
    console.log("Last OIDC token", lastOidcToken())
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        attachJSON(world, error.response.status)
        attachJSON(world, error.response.headers)
        attachJSON(world, error.response.data)
    } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log("REQUEST ERROR")
        console.log(error.request);
    } else {
        console.log("SOMETHING ELSE ERROR")
        // Something happened in setting up the request that triggered an Error
        attachText(world, error.message)
        console.log('Error', error.message);
    }
    console.log(error.config);
}

module.exports = {
    handleError
}