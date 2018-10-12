/**
 * Router handlers
 */

const handlers = {}

handlers.ping = ( data, callback ) => callback( 200 )

handlers.sample = ( data, callback ) => callback( 406, { "name": "Sample handler" } )

handlers.notFound = ( data, callback ) => callback( 404 )

const router = {
    'ping' : handlers.ping,
    'sample' : handlers.sample,
    'notFound' : handlers.notFound
}

module.exports = router;