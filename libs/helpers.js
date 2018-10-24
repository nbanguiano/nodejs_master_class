/**
 * Generic helpers
 */

const crypto = require( 'crypto' ),
      config = require( '../config' )

const helpers = { 'request' : {}, 'data' : {} }

helpers.request.getHeader = ( headerName, data ) => !data.headers ? null : data.headers[ headerName ]

helpers.request.getQueryParam = ( paramName, data ) => !data.query ? null : data.query[ paramName ]

helpers.data.isValidString = str => ( typeof( str ) === 'string' && str.trim().length > 0 )

helpers.data.isValidPhone = str => ( typeof( str ) === 'string' && str.trim().length === 10 )

helpers.data.isValidBoolean = bool => ( typeof( bool ) === 'boolean' && bool === true )

helpers.data.hash = str => {
    if ( helpers.data.isValidString( str ) ) {
        var hash = crypto.createHmac( 'sha256', config.hashSecret )
                         .update( str )
                         .digest( 'hex' )
        return hash
    }
    else {
        return false
    }
}

helpers.data.parseJSONSafe = str => {
    try { return JSON.parse( str ) } 
    catch ( e ) { return {} }
}

module.exports = helpers;