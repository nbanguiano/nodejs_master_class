/**
 * Some utility functions
 */

const utils = {

    // Source https://mostly-adequate.gitbooks.io/mostly-adequate-guide/appendix_a.html
    // compose
    compose: ( ...fns ) => ( ...args ) => fns.reduceRight( ( res, fn ) => [ fn.call( null, ...res ) ], args )[ 0 ],

    // curry :: ((a, b, ...) -> c) -> a -> b -> ... -> c
    curry: ( fn ) => {
        const arity = fn.length;
        return function $curry( ...args ) {
            if ( args.length < arity ) {
                return $curry.bind( null, ...args )
            }
            return fn.call( null, ...args )
        }
    }
}

module.exports = utils;