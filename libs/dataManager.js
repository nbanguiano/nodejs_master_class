/**
 * Data management library
 * Handlers for all CRUD uperatoins (create, read, update, delete)
 */

// Dependencies
const fs = require( 'fs' ),
      path = require( 'path' ),
      { promisify } = require( 'util' ),
      util = require( './utils' )
      g = require( '../global' )

// Promisify all file system methods used
const openFile = promisify( fs.open ),
      readFile = promisify( fs.readFile ),
      writeFile = promisify( fs.writeFile ),
      truncateFile = promisify( fs.truncate ),
      closeFile = promisify( fs.close ),
      unlinkFile = promisify( fs.unlink )

const baseDir = path.join( __dirname, '/../.data' )

// 'C'RUD
const _create = util.curry( ( filePromises, baseDir, dir, file, data, callback ) => {

    const stringData = JSON.stringify(data)

    // From callback hell, to Promise semi-hell... ¯\_(ツ)_/¯
    filePromises.open( `${baseDir}/${dir}/${file}.json`, 'wx' )
    .then( fileDescriptor => 
        filePromises.write( fileDescriptor, stringData )
        .then( () =>
            filePromises.close( fileDescriptor )
            .then( () => callback( false ) )
            .catch( e => callback( 'ERROR: Could not close the file.', e ) )
        )
        .catch( e => callback( 'ERROR: Could not write to file.', e ) )
    )
    .catch( e => callback( 'ERROR: Could not create file. It may already exist.', e ) )
} )
( { 'open' : openFile, 'write' : writeFile, 'close' : closeFile } )
( baseDir )

// C'R'UD
const _read = util.curry( ( filePromises, encoding, baseDir, dir, file, callback ) => {

    filePromises.read( `${baseDir}/${dir}/${file}.json`, encoding )
    .then( data => callback( false, data ) )
    .catch( e => callback( 'ERROR: Could not read file.', e ) )
} )
( { 'read' : readFile } )
( g.encoding )
( baseDir )

// CR'U'D
const _update = util.curry( ( filePromises, baseDir, dir, file, data, callback ) => {

    filePromises.open( `${baseDir}/${dir}/${file}.json`, 'r+' )
    .then( fileDescriptor => {
        const stringData = JSON.stringify(data)
        filePromises.truncate( fileDescriptor )
        .then( () => {
            filePromises.write( fileDescriptor, stringData )
            .then( () =>
                filePromises.close( fileDescriptor )
                .then( () => callback( false ) )
                .catch( e => callback( 'ERROR: Could not close the file.', e ) )
            )
            .catch( e => callback( 'ERROR: Could not write to file.', e ) )
        } )
        .catch( e => callback( 'ERROR: Could not truncate the file.', e ) )
    } )
    .catch( e => callback( 'ERROR: Could not create file. It may not exist.', e ) )
} )
( { 'open' : openFile, 'write' : writeFile, 'truncate' : truncateFile, 'close' : closeFile } )
( baseDir )

// CRU'D'
const _delete = util.curry( ( filePromises, baseDir, dir, file, callback ) => {

    filePromises.unlink( `${baseDir}/${dir}/${file}.json` )
    .then( () => callback( false ) )
    .catch( e => callback( 'ERROR: Could not delete file', e ) )
} )
( { 'unlink' : unlinkFile } )
( baseDir )

// The actual export
module.exports = {
    'create' : promisify( _create ),
    'read' : promisify( _read ),
    'update' : promisify( _update ),
    'delete' : promisify( _delete )
}