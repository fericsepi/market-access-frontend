const backend = require( './backend-request' );

function getToken( req ){

	return req.session.ssoToken;
}

function getValue( input ){

	return input || null;
}

function sortReportProgress( item ){

	if( Array.isArray( item.progress ) ){

		item.progress.sort( ( a, b ) => {

			const aCode = a.stage_code;
			const bCode = b.stage_code;

			if( aCode === bCode ){ return 0; }
			if( Number( aCode ) < Number( bCode ) ){ return -1; }
			if( Number( aCode ) > Number( bCode ) ){ return 1; }
		} );
	}
}

function transformReport( { response, body } ){

	if( response.isSuccess ){

		sortReportProgress( body );
	}

	return { response, body };
}

function transformReports( { response, body } ){

	if( response.isSuccess && Array.isArray( body.results ) ){

		body.results.forEach( sortReportProgress );
	}

	return { response, body };
}

module.exports = {

	getMetadata: () => backend.get( '/metadata/' ),
	getUser: ( req ) => backend.get( '/whoami/', getToken( req ) ),
	getReports: ( req ) => backend.get( '/reports/', getToken( req ) ).then( transformReports ),
	getReport: ( req, reportId ) => backend.get( `/reports/${ reportId }/`, getToken( req ) ).then( transformReport ),
	saveNewReport: ( req, { status, emergency }, company, contactId ) => backend.post( '/reports/', getToken( req ), {
		problem_status: getValue( status ),
		is_emergency: getValue( emergency ),
		company_id: getValue( company.id ),
		company_name: getValue( company.name ),
		contact_id: getValue( contactId )
	} ),
	updateReport: ( req, reportId, { status, emergency }, company, contactId ) => backend.put( `/reports/${ reportId }/`, getToken( req ), {
		problem_status: getValue( status ),
		is_emergency: getValue( emergency ),
		company_id: getValue( company.id ),
		company_name: getValue( company.name ),
		contact_id: getValue( contactId )
	} ),
	saveProblem: ( req, reportId, problem ) => backend.put( `/reports/${ reportId }/`, getToken( req ), {
		product: getValue( problem.item ),
		commodity_codes: getValue( problem.commodityCode ),
		export_country: getValue( problem.country ),
		problem_description: getValue( problem.description ),
		barrier_title: getValue( problem.barrierTitle )
	} ),
	saveImpact: ( req, reportId, values ) => backend.put( `/reports/${ reportId }/`, getToken( req ), {
		problem_impact: getValue( values.impact ),
		estimated_loss_range: getValue( values.losses ),
		other_companies_affected: getValue( values.otherCompanies ),
		other_companies_info: getValue( values.otherCompaniesInfo )
	} ),
	saveLegal: ( req, reportId, values ) => backend.put( `/reports/${ reportId }/`, getToken( req ), {
		has_legal_infringment: getValue( values.hasInfringed ),
		wto_infingment: !!values.infringments.wtoInfringment,
		fta_infingment: !!values.infringments.ftaInfringment,
		other_infingment: !!values.infringments.otherInfringment,
		infringment_summary: getValue( values.infringmentSummary )
	} ),
	saveBarrierType: ( req, reportId, values ) => backend.put( `/reports/${ reportId }/`, getToken( req ), {
		barrier_type: getValue( values.barrierType )
	} ),
	saveSupport: ( req, reportId, values ) => backend.put( `/report/${ reportId }/`, getToken( req ), {
		is_resolved: getValue( values.resolved ),
		support_type: getValue( values.supportType ),
		steps_taken: getValue( values.stepsTaken ),
		is_politically_sensitive: getValue( values.politicalSensitivities ),
		political_sensitivity_summary: getValue( values.sensitivitiesDescription )
	} ),
	saveNextSteps: ( req, reportId, values ) => backend.put( `/reports/${ reportId }/`, getToken( req ), {
		govt_response_requester: getValue( values.response ),
		is_confidential: getValue( values.sensitivities ),
		sensitivity_summary: getValue( values.sensitivitiesText ),
		can_publish: getValue( values.permission )
	} )
};
