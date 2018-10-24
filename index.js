/**
 * Main API entry
 */

// Dependencies
const http = require( 'http' ),
      https = require( 'https' ),
      fs = require( 'fs' ),
      url = require( 'url' ),
      StringDecoder = require( 'string_decoder' ).StringDecoder,
      config = require('./config')
      util = require( './libs/utils' ),
      router = require( './libs/router' ),
      helpers = require( './libs/helpers' )
    
// Generic URL parser
const urlParser = util.curry(
    ( urlHandler, withQuery, urlString ) => 
    urlHandler.parse( urlString, withQuery ) )( url )

// URL parser that reads the query string    
const urlParserWithQuery = urlParser( true )

// Main server handler
const serverHandler = util.curry(
    ( helpers, req, res ) => {

    // Basic request info
    const method = req.method.toUpperCase(),
          headers = req.headers

    // Deconstruct the URL into path, and query
    const parsedUrl = helpers.urlParser( req.url ),
          path = parsedUrl.pathname.replace( /^\/+|\/+$/g, '' ),
          queryStringObj = parsedUrl.query

    // Initialize a buffer to get fed the payload from the request
    let buffer = '';
    
    // append info to the buffer
    req.on( 'data', data => buffer += helpers.stringDecoder.write( data ) )
    
    req.on( 'end', () => {    
        // 'close' the buffer
        buffer += helpers.stringDecoder.end()
        
        // choose the router handler
        const handler = typeof( helpers.router[ path ] ) !== 'undefined' ?
            helpers.router[ path ] :
            helpers.router.notFound 

        const data = {
            'path' : path,
            'query' : queryStringObj,
            'method' : method,
            'headers' : headers,
            'payload' : helpers.dataHelpers.parseJSONSafe( buffer )
        }

        // call the router handler with some defaults
        handler( data, ( statusCode = 200, payload = {} ) => {
            const payloadString = JSON.stringify( payload )

            res.setHeader( 'Content-Type', 'application/json' )
            res.writeHead( statusCode )
            res.end( payloadString )
            
            helpers.logger( `Status code ${statusCode} >> ${payloadString}` )
        } )
    } )
} )
( { 'logger' : console.log, 
    'urlParser': urlParserWithQuery, 
    'stringDecoder' : new StringDecoder( 'utf-8' ), 
    'router' : router,
    'dataHelpers' : helpers.data } )

// Create and start the HTTP server
const httpServer = http.createServer( serverHandler )
const logListening = console.log( `Server in '${config.env}' mode. Listening on port ${config.httpPort}.` )
httpServer.listen( config.httpPort, logListening )


// Create and start the HTTPS server
const httpsOptions = {
    'key' : fs.readFileSync( './https/key.pem' ),
    'cert' : fs.readFileSync( './https/cert.pem' )
}
const httpsServer = https.createServer( httpsOptions, serverHandler )
const logListening_s = console.log( `Server in '${config.env}' mode. Listening on port ${config.httpsPort}.` )
httpsServer.listen( config.httpsPort, logListening_s )