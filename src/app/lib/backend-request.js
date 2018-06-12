const request = require( 'request' );
const config = require( '../config' );
const logger = require( './logger' );

function makeRequest( method, path, opts = {} ){

	if( !path ){
		throw new Error( 'Path is required' );
	}

	const uri = ( config.backend.url + path );

	const requestOptions = {
		uri,
		method,
		json: true
	};

	if( opts.token ){

		requestOptions.headers = { Authorization: `Bearer ${ opts.token }` };
	}

	if( opts.body ){

		requestOptions.body = opts.body;
	}

	return new Promise( ( resolve, reject ) => {

		logger.debug( `Sending ${ method } request to: ${ uri }` );

		request( requestOptions, ( err, response, body ) => {

			if( err ){

				reject( err );

			} else {

				response.isSuccess = ( response.statusCode >= 200 && response.statusCode <= 300 );

				if( response.isSuccess || response.statusCode === 404 ){

					resolve( { response, body } );

				} else {

					reject( new Error( `Got at ${ response.statusCode } response code from backend` ) );
				}
			}
		} );
	} );
}

module.exports = {

	get: ( path, token ) => makeRequest( 'GET', path, { token } ),
	post: ( path, token, body ) => makeRequest( 'POST', path, { token, body } ),
	put: ( path, token, body ) => makeRequest( 'PUT', path, { token, body } )
};
