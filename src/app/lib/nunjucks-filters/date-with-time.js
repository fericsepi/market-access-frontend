const dateFormat = require( 'dateformat' );

function isValid( datestr ){

	return ( typeof datestr === 'number' ) || !!Date.parse( datestr );
}

module.exports = function( datestr ){

	let date;

	if( datestr && isValid( datestr ) ){

		date = new Date( datestr );
		return dateFormat( date, 'GMT:d mmmm yyyy "at" h:MMtt' );
	}

	return datestr;
};
