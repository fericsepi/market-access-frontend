const config = require( '../config' );
const raven = require( 'raven' );
const logger = require( './logger' );

const useSentry = !!config.sentryDsn;

if( useSentry ){

	raven.config( config.sentryDsn, { release: config.version } ).install();
}

module.exports = {

	levels: {
		debug: 'debug',
		info: 'info',
		warning: 'warning',
		error: 'error',
		fatal: 'fatal',
	},

	setup: function( app ){

		if( useSentry ){

			app.use( raven.requestHandler() );
		}
	},

	handleErrors: function( app ){

		if( useSentry ){

			app.use( raven.errorHandler() );
		}
	},

	message: function( level, msg, extra ){

		if( useSentry ){

			raven.captureMessage( msg, {
				level,
				extra
			} );

		} else {

			logger.warn( msg );
			if( extra ){ logger.warn( JSON.stringify( extra ) ); }
		}
	},

	captureException: function( err, extra ){

		if( useSentry ){

			raven.captureException( err, { extra } );

		} else {

			logger.error( err.stack );
			if( extra ){ logger.error( JSON.stringify( extra ) ); }
		}
	}
};
