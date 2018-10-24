/**
 * Configuration settings
 */

const configurations = {}

configurations.dev = {
    'env' : 'development',
    'httpPort' : 3000,
    'httpsPort' : 3001,
    'hashSecret' : 'bla'
}

configurations.prod = {
    'env' : 'production',
    'httpPort' : 80,
    'httpsPort' : 443,
    'hashSecret' : 'blu'
}

const node_env = 
      typeof( process.env.NODE_ENV ) === 'string' ? 
      process.env.NODE_ENV.toLowerCase() : ''

const configuration = 
      typeof( configurations[ node_env ] ) === 'object' ? 
      configurations[ node_env ] : configurations.dev

module.exports = configuration;