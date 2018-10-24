/**
 * Router handlers
 */

// Dependencies
const { hello } = require( './handlers/hello' ),
      users = require( './handlers/users' )

// Quick reusable helpers

const handlers = {}

handlers.sample = ( data, callback ) => callback( 406, { 'name' : 'Sample handler' } )

handlers.hello = hello

handlers.users = users

handlers.notFound = ( data, callback ) => callback( 404 )

// Actual export
const router = {
    'ping' : handlers.ping,
    'sample' : handlers.sample,
    'hello' : handlers.hello,
    'users' : handlers.users.main,
    'notFound' : handlers.notFound
}

module.exports = router;