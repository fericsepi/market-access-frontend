const Form = require( '../../../lib/Form' );
const FormProcessor = require( '../../../lib/FormProcessor' );
const metadata = require( '../../../lib/metadata' );
const validators = require( '../../../lib/validators' );
const govukItemsFromObj = require( '../../../lib/govuk-items-from-object' );
const getDateParts = require( '../../../lib/get-date-parts' );
const backend = require( '../../../lib/backend-service' );
const urls = require( '../../../lib/urls' );
const barrierFileds = require( '../../../lib/barrier-fields' );

const { RESOLVED, PART_RESOLVED } = metadata.barrier.status.types;

module.exports = {

	title: async ( req, res, next ) => {

		const barrier = req.barrier;
		const form = new Form( req, {

			title: {
				values: [ barrier.barrier_title ],
				required: 'Enter a title for this barrier'
			},
		} );

		const processor = new FormProcessor( {
			form,
			render: ( templateValues ) => res.render( 'barriers/views/edit/title', templateValues ),
			saveFormData: ( formValues ) => backend.barriers.saveTitle( req, barrier.id, formValues ),
			saved: () => res.redirect( urls.barriers.detail( barrier.id ) )
		} );

		try {

			await processor.process();

		} catch( e ){

			next( e );
		}
	},

	product: async ( req, res, next ) => {

		const barrier = req.barrier;
		const form = new Form( req, {

			product: {
				values: [ barrier.product ],
				required: 'Enter a product or service'
			},
		} );

		const processor = new FormProcessor( {
			form,
			render: ( templateValues ) => res.render( 'barriers/views/edit/product', templateValues ),
			saveFormData: ( formValues ) => backend.barriers.saveProduct( req, barrier.id, formValues ),
			saved: () => res.redirect( urls.barriers.detail( barrier.id ) )
		} );

		try {

			await processor.process();

		} catch( e ){

			next( e );
		}
	},

	description: async ( req, res, next ) => {

		const barrier = req.barrier;
		const form = new Form( req, {

			description: {
				values: [ barrier.problem_description ],
				required: 'Enter a brief description for this barrier'
			},
		} );

		const processor = new FormProcessor( {
			form,
			render: ( templateValues ) => res.render( 'barriers/views/edit/description', templateValues ),
			saveFormData: ( formValues ) => backend.barriers.saveDescription( req, barrier.id, formValues ),
			saved: () => res.redirect( urls.barriers.detail( barrier.id ) )
		} );

		try {

			await processor.process();

		} catch( e ){

			next( e );
		}
	},

	status: async ( req, res, next ) => {

		const barrier = req.barrier;
		const isResolved = ( barrier.status.id === RESOLVED || barrier.status.id === PART_RESOLVED );

		const formFields = {};

		if( isResolved ){

			const resolvedDateValues = getDateParts( barrier.status.date );

			formFields.statusDate = barrierFileds.createStatusDate( resolvedDateValues );
		}

		formFields.statusSummary = {
			values: [ barrier.status.summary ],
			required: 'Enter a summary'
		};

		const form = new Form( req, formFields );
		const processor = new FormProcessor( {
			form,
			render: ( templateValues ) => res.render( 'barriers/views/edit/status', { ...templateValues, isResolved } ),
			saveFormData: ( formValues ) => backend.barriers.saveStatus( req, barrier.id, formValues ),
			saved: () => res.redirect( urls.barriers.detail( barrier.id ) )
		} );

		try {

			await processor.process();

		} catch( e ){

			next( e );
		}
	},

	source:  async ( req, res, next ) => {

		const barrier = req.barrier;
		const form = new Form( req, {
			source: {
				type: Form.RADIO,
				values: [ barrier.source ],
				items: govukItemsFromObj( metadata.barrierSource ),
				validators: [
					{
						fn: validators.isMetadata( 'barrierSource' ),
						message: 'Select how you became aware of the barrier'
					}
				]
			},

			sourceOther: {
				values: [ barrier.other_source ],
				conditional: { name: 'source', value: 'OTHER' },
				required: 'Enter how you became aware of the barrier'
			},
		} );

		const processor = new FormProcessor( {
			form,
			render: ( templateValues ) => res.render( 'barriers/views/edit/source', templateValues ),
			saveFormData: ( formValues ) => backend.barriers.saveSource( req, barrier.id, formValues ),
			saved: () => res.redirect( urls.barriers.detail( barrier.id ) )
		} );

		try {

			await processor.process();

		} catch( e ){

			next( e );
		}
	},

	priority: async ( req, res, next ) => {

		const barrier = req.barrier;
		const form = new Form( req, {
			priority: {
				type: Form.RADIO,
				values: [ barrier.priority.code ],
				items: metadata.getBarrierPrioritiesList(),
				validators: [
					{
						fn: validators.isBarrierPriority,
						message: 'Select a barrier priority'
					}
				]
			},

			priorityDescription: {},
		} );

		const processor = new FormProcessor( {
			form,
			render: ( templateValues ) => res.render( 'barriers/views/edit/priority', {
				...templateValues,
				isUnknown: ( barrier.priority.code === metadata.barrier.priority.codes.UNKNOWN )
			} ),
			saveFormData: ( formValues ) => backend.barriers.savePriority( req, barrier.id, formValues ),
			saved: () => res.redirect( urls.barriers.detail( barrier.id ) )
		} );

		try {

			await processor.process();

		} catch( e ){

			next( e );
		}
	},

	euExitRelated: async ( req, res, next ) => {

		const barrier = req.barrier;
		const form = new Form( req, {
			euExitRelated: {
				type: Form.RADIO,
				values: [ barrier.eu_exit_related ],
				validators: [ {
					fn: validators.isMetadata( 'optionalBool' ),
					message: 'Select whether this is EU exit related or not'
				} ],
				items: govukItemsFromObj( metadata.optionalBool )
			}
		} );

		const processor = new FormProcessor( {
			form,
			render: ( templateValues ) => res.render( 'barriers/views/edit/eu-exit-related', templateValues ),
			saveFormData: ( formValues ) => backend.barriers.saveEuExitRelated( req, barrier.id, formValues ),
			saved: () => res.redirect( urls.barriers.detail( barrier.id ) )
		} );

		try {

			await processor.process();

		} catch( e ){

			next( e );
		}
	},

	problemStatus: async ( req, res, next ) => {

		const barrier = req.barrier;

		const form = new Form( req, {
			problemStatus: {
				type: Form.RADIO,
				values: [ barrier.problem_status ],
				items: govukItemsFromObj( metadata.statusTypes ),
				validators: [{
					fn: validators.isMetadata( 'statusTypes' ),
					message: 'Select a barrier scope'
				}]
			}
		} );

		const processor = new FormProcessor( {
			form,
			render: ( templateValues ) => res.render( 'barriers/views/edit/problem-status', templateValues ),
			saveFormData: ( formValues ) => backend.barriers.saveProblemStatus( req, barrier.id, formValues ),
			saved: () => res.redirect( urls.barriers.detail( barrier.id ) )
		} );

		try {

			await processor.process();

		} catch( e ){

			next( e );
		}
	},
};
