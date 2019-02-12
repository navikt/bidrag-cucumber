const { base64encode } = require('nodejs-base64')

/**
 * Cucumber report forventer base64 encoded data i attachments/embeddings
 * Må kalles fra step slik at vi har tilgang til World (this).
 * 
 * @param {String} str 
 */
function toB64(str) {
    return base64encode(str);
}

module.exports = {
    toB64
};
