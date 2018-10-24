/**
 * The hello handler
 */

const g = require( '../../global'),
      util = require( '../utils' ),
      { getQueryParam, getHeader } = require( '../helpers' ).request

module.exports = {

    hello: util.curry( ( queryGetter, headerGetter, supportedLangs, data, callback ) => {

        const supportedHellos = { // 'en', 'de', 'fr', 'it', 'es'
            'en' : 'Hello',
            'de' : 'Hallo',
            'fr' : 'Bonjour',
            'it' : 'Ciao',
            'es' : 'Hola'
        }

        const queryLang = queryGetter( 'lang', data )
        
        // the Accept-Language header has a locale like so en-US, de-CH, es-ES, plus some other meta info
        // Or undefined in the header is not set, in which case default to English
        const headerLang = headerGetter( 'accept-language', data )
        
        // The query 'lang' parameter would have precedence over the header, if set
        const userLang = queryLang ? queryLang :
                        headerLang ? headerLang.split( '-' ).shift() : // <- Just the language, without the country
                        'en' // <- default to english
        
        const supportedLang = supportedLangs.filter( lang => lang == userLang )[0]

        const msg = supportedHellos[ supportedLang || 'en' ] // <- **
        // **default to English again, in case the header or query param were set, but to an unsupported language
        //   in which case 'supportedLang' would be undefined

        callback( 200, { 'msg' : msg } )
    } )
    ( getQueryParam )
    ( getHeader )
    ( g.supportedLangs )
}