const { base64encode } = require('nodejs-base64')

/**
 * Cucumber report forventer base64 encoded data i attachments/embeddings
 * Må kalles fra step slik at vi har tilgang til World (this).
 * 
 * @param {String} str 
 */
function attachString(str) {
    this.attach(base64encode(str), 'text/plain')
}

module.exports = {
    attachString
};
