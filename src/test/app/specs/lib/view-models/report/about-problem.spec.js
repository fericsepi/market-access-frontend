const proxyquire = require( 'proxyquire' );
const uuid = require( 'uuid/v4' );
const modulePath = '../../../../../../app/lib/view-models/report/about-problem';

const csrfToken = uuid();
const viewModelResponse = {
	csrfToken,
	losses: [
		{
			value: '1',
			text: 'ut vel et',
			checked: false
		},{
			value: '2',
			text: 'dolores quia iste',
			checked: false
		},{
			value: '3',
			text: 'qui incidunt explicabo',
			checked: false
		},{
			value: '4',
			text: 'velit error blanditiis',
			checked: false
		}
	],
	otherCompanies: [
		{
			value: '1',
			text: 'Yes',
			checked: false
		},{
			value: '2',
			text: 'No',
			checked: false
		},{
			value: '3',
			text: "Don't know",
			checked: false
		}
	],
	countries: [
		{ value: '', text: 'Please choose a country' },
		{ value: 'abc', text: 'a' },
		{ value: 'def', text: 'b' },
		{ value: 'ghi', text: 'c' }
	]
};

describe( 'Start form view model', () => {

	let viewModel;
	let metadata;

	beforeEach( () => {

		metadata = {
			lossScale: {
				"1": "ut vel et",
				"2": "dolores quia iste",
				"3": "qui incidunt explicabo",
				"4": "velit error blanditiis"
			},
			boolScale: {
				"1": "Yes",
				"2": "No",
				"3": "Don't know"
			},
			countries: [
				{ id: 'abc', name: 'a' },
				{ id: 'def', name: 'b' },
				{ id: 'ghi', name: 'c' }
			]
		};

		viewModel = proxyquire( modulePath, {
			'../../metadata': metadata
		} );
	} );

	describe( 'Without any form or session values', () => {
		it( 'Should get data and return a view model', () => {

			const model = viewModel( csrfToken );

			expect( model ).toEqual( viewModelResponse );
		} );
	} );

	describe( 'With form values', () => {
		describe( 'With a losses value', () => {
			it( 'Should mark the correct one as checked', () => {

				let model = viewModel( csrfToken, { losses: '2' } );

				expect( model.losses[ 0 ].checked ).toEqual( false );
				expect( model.losses[ 1 ].checked ).toEqual( true );
				expect( model.losses[ 2 ].checked ).toEqual( false );
				expect( model.losses[ 3 ].checked ).toEqual( false );
			} );
		} );

		describe( 'With an otherCompanies value', () => {
			it( 'Should mark the correct one as checked', () => {

				let model = viewModel( csrfToken, { otherCompanies: '3' } );

				expect( model.otherCompanies[ 0 ].checked ).toEqual( false );
				expect( model.otherCompanies[ 1 ].checked ).toEqual( false );
				expect( model.otherCompanies[ 2 ].checked ).toEqual( true );
			} );
		} );

		describe( 'With a country value', () => {
			it( 'Should mark the correct one as selected', () => {

				let model = viewModel( csrfToken, { country: 'def' } );

				expect( model.countries[ 0 ].selected ).not.toBeDefined();
				expect( model.countries[ 1 ].selected ).not.toBeDefined();
				expect( model.countries[ 2 ].selected ).toEqual( true );
				expect( model.countries[ 3 ].selected ).not.toBeDefined();
			} );
		} );
	} );

	describe( 'Creating multiple models', () => {

		it( 'Should only create the radioItems once', () => {

			const radioItemsFromObject = jasmine.createSpy( 'radioItemsFromObject' );

			viewModel = proxyquire( modulePath, {
				'../../metadata': metadata,
				'../../radio-items-from-object': radioItemsFromObject
			} );

			radioItemsFromObject.and.callFake( () => [ {} ] );

			viewModel( csrfToken );

			expect( radioItemsFromObject.calls.count() ).toEqual( 2 );

			viewModel( csrfToken );

			expect( radioItemsFromObject.calls.count() ).toEqual( 2 );

			viewModel( csrfToken );

			expect( radioItemsFromObject.calls.count() ).toEqual( 2 );
		} );
	} );
} );
