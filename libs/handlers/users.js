/**
 * The users handler
 */

const dataManager = require( '../dataManager' ),
      dataHelpers = require( '../helpers' ).data,
      util = require( '../utils' )

const users = { methods : [ 'post', 'get', 'put', 'delete' ], _users : {} }

users.main = ( data, callback ) => {

    if ( users.methods.indexOf( data.method.toLowerCase() ) > -1 ) {
        users._users[ data.method.toLowerCase() ]( data, callback )
    }
    else {
        callback( 405 )
    }
}

const validateAllInfo = util.curry( ( validators, data ) => {

    var validations = [
        { 'datum' : data.payload.firstName, 'validator' : validators.isValidString },
        { 'datum' : data.payload.lastName, 'validator' : validators.isValidString },
        { 'datum' : data.payload.phone, 'validator' : validators.isValidPhone },
        { 'datum' : data.payload.password, 'validator' : validators.isValidString },
        { 'datum' : data.payload.tosAgreement, 'validator' : validators.isValidBoolean }
    ]

    var allPass = validations.reduce( ( acc, data ) => {
        return ( acc === true ) ? data.validator( data.datum ) : false
    }, true )

    return allPass;
} )
( dataHelpers )


// Required data: firstName, lastName, phone, password, tosAgreement 
users._users.post = util.curry( ( dataManager, data, callback ) => {
    
    const _data = data.payload

    if ( !dataManager.validateAllInfo( data ) ) {
        callback( 400, { 'Error' : 'Missing mandatory info' } )
        return;
    }

    dataManager.read( 'users', _data.phone )
    .then( data => {  
        // If all good, it means that the user exists
        callback( 400, { 'Error' : 'A user with this phone number already exists' } )
    } )
    .catch( e => {
        // If not, we can now create it
        const hashedPwd = dataManager.hash( _data.password )

        if ( !hashedPwd ) { 
            callback( 500, { 'Error' : 'Could not hash password.' } )
            return;
        }

        // Create user
         const NewUser = {
            'firstName' : _data.firstName,
            'lastName' : _data.lastName,
            'phone' : _data.phone,
            'tosAgreement' : _data.tosAgreement,
            'hashedPwd' : hashedPwd
        }

        dataManager.create( 'users', _data.phone, NewUser )
        .then( () => callback( 200, NewUser ) )
        .catch( e => callback( 500, { 'Error' : `Could not create user. ${e}` } ) )
    } )
} )
( Object.assign( dataManager, { 'validateAllInfo' : validateAllInfo } ) )


// Required data: phone
users._users.get = util.curry( ( dataManager, data, callback ) => {

    const phone = data.query.phone

    if ( !dataManager.isValidPhone( phone ) ) {
        callback( 400, { 'Error' : 'Missing mandatory info (phone) or sent in a bad format' } )
        return;
    }

    dataManager.read( 'users', phone )
    .then( user => {
        user = dataManager.parseJSONSafe( user )
        delete user.hashedPwd
        callback( 200, user )
    } )
    .catch( e => callback( 404, { 'Error' : `Could not read user. ${e}` } ) )
} )
( Object.assign( dataManager, dataHelpers ) )


// Required data: phone
// Optional data: everything else
users._users.put = util.curry( ( dataManager, data, callback ) => {

    const phone = dataManager.isValidPhone( data.payload.phone ) ? data.payload.phone : false,
          firstName = dataManager.isValidString( data.payload.firstName ) ? data.payload.firstName : false,
          lastName = dataManager.isValidString( data.payload.lastName ) ? data.payload.lastName : false,
          password = dataManager.isValidString( data.payload.password ) ? data.payload.password : false;

    if ( !phone ) {
        callback( 400, { 'Error' : 'Missing mandatory info (phone) or sent in a bad format' } )
        return;
    }

    if ( !firstName && !lastName && !password ) {
        callback( 400, { 'Error' : 'At least one optional field must be provided and in a valid format' } )
        return;
    }

    dataManager.read( 'users', data.payload.phone )
    .then( userInfo => {
        user = dataManager.parseJSONSafe( userInfo )
        if ( firstName ) user.firstName = firstName
        if ( lastName ) user.lastName = lastName
        if ( password ) user.hashedPwd = dataManager.hash( password )

        dataManager.update( 'users', phone, user )
        .then( () => callback( 200 ) )
        .catch( e => callback( 500, { 'Error' : `Could not update user. ${e}` } ) )
    } )
    .catch( e => callback( 400, { 'Error' : `Could not read user. ${e}` } ) )
} )
( Object.assign( dataManager, dataHelpers ) )


// Required data: phone
users._users.delete = util.curry( ( dataManager, data, callback ) => {

    const phone = data.query.phone

    if ( !dataManager.isValidPhone( phone ) ) {
        callback( 400, { 'Error' : 'Missing mandatory info (phone) or sent in a bad format' } )
        return;
    }

    dataManager.read( 'users', phone )
    .then( () => {
        dataManager.delete( 'users', phone )
        .then( () => callback( 200 ) )
        .catch( e => callback( 500, { 'Error' : `Could not delete user. ${e}` } ) )
    } )
    .catch( e => callback( 400, { 'Error' : `Could not find user. ${e}` } ) )
} )
( Object.assign( dataManager, dataHelpers ) )

module.exports = users