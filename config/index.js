require('log4js').configure(__dirname + '/log4js.json');
var config = {
    development: {
        debug: true,
        port: 3000,
        modules: {
            mlm: {
                module: process.cwd() + '/lib'
            }
        }
    },
    production: {
        debug: false,
        port: 3000,
        modules: {
            mlm: {
                module: process.cwd() + '/lib'
            }
        }
    }
};

var env = process.env.NODE_ENV||'development';
config = config[env]||config['development'];
config.env = env;

module.exports = config;
