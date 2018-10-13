/**
 * Data handling library
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

// The actual export
const dataHandler = {}

dataHandler.baseDir = path.join( __dirname, '/../.data' )

// 'C'RUD
dataHandler.create = util.curry( ( filePromises, baseDir, dir, file, data, callback ) => {

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
( dataHandler.baseDir )

// C'R'UD
dataHandler.read = util.curry( ( filePromises, encoding, baseDir, dir, file, callback ) => {

    filePromises.read( `${baseDir}/${dir}/${file}.json`, encoding )
    .then( data => callback( false, data ) )
    .catch( e => callback( 'ERROR: Could not read file.', e ) )
} )
( { 'read' : readFile } )
( g.encoding )
( dataHandler.baseDir )

// CR'U'D
dataHandler.update = util.curry( ( filePromises, baseDir, dir, file, data, callback ) => {

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
( dataHandler.baseDir )

// CRU'D'
dataHandler.delete = util.curry( ( filePromises, baseDir, dir, file, callback ) => {

    filePromises.unlink( `${baseDir}/${dir}/${file}.json` )
    .then( () => callback( false ) )
    .catch( e => callback( 'ERROR: Could not delete file', e ) )
} )
( { 'unlink' : unlinkFile } )
( dataHandler.baseDir )

module.exports = dataHandler