const backend = require( './backend-request' );

module.exports = {

	getMetadata: () => backend.get( '/metadata/' ),
	getUser: ( req ) => backend.get( '/whoami/', req.session.ssoToken ),
	saveNewReport: ( req, { status, emergency }, company ) => backend.post( '/barriers/', req.session.ssoToken, {
		problem_status: status,
		is_emergency: emergency,
		company_id: company.id,
		company_name: company.name
	} ),
	getBarriers: ( req ) => backend.get( '/barriers/', req.session.ssoToken ),
	saveContact: ( req, barrierId, contactId ) => backend.put( `/barriers/${ barrierId }/`, req.session.ssoToken, {
		contact_id: contactId
	} )
};
