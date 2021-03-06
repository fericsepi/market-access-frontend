const proxyquire = require( 'proxyquire' );
const faker = require( 'faker' );
const modulePath = './detail';

const { OPEN, RESOLVED, PART_RESOLVED, HIBERNATED } = require( '../../../lib/metadata' ).barrier.status.types;

describe( 'Barrier detail view model', () => {

	let viewModel;
	let metadata;
	let inputBarrier;
	let config;
	let strings;

	beforeEach( () => {

		inputBarrier = jasmine.helpers.getFakeData( '/backend/barriers/barrier' );

		metadata = {
			countries: [
				{ id: '1234', name: 'Fake Country Name' },
				{ id: faker.random.uuid(), name: faker.address.country() },
				{ id: faker.random.uuid(), name: faker.address.country() },
				{ id: faker.random.uuid(), name: faker.address.country() },
				{ id: faker.random.uuid(), name: faker.address.country() }
			],
			adminAreas: [
				{ id: '3456', name: 'Fake admin area 1', country: { name: 'Fake Country Name', id: '1234'} },
			],
			sectors: [
				{ id: faker.random.uuid(), name: faker.lorem.words() },
				{ id: faker.random.uuid(), name: faker.lorem.words() },
				{ id: faker.random.uuid(), name: faker.lorem.words() }
			],
			statusTypes: {
				'1': 'Problem status one',
				'2': 'Problem status two'
			},
			getCountry: jasmine.createSpy( 'metadata.getCountry' ),
			getAdminArea: jasmine.createSpy('meta.getAdminArea'),
			getSector: jasmine.createSpy( 'metadata.getSector' ),
			getBarrierType: jasmine.createSpy( 'metdata.getBarrierType' ),
			barrierSource: {
				'COMPANY': 'company',
				'TRADE': 'trade',
				'OTHER': 'other'
			},
			barrierTypeCategories: {
				GOODS: 'some goods',
				SERVICES: 'some services'
			},
			optionalBool: {
				1: 'A',
				2: 'B',
				3: 'C'
			},
			barrierTypes: [
				{ title: 'A', description: 'a description' },
				{ title: 'B', description: 'b description' },
				{ title: 'C', description: 'c description' },
			],
		};

		config = { addCompany: false };
		strings = jasmine.helpers.mocks.strings();

		metadata.getCountry.and.callFake( () => metadata.countries[ 3 ] );
		metadata.getSector.and.callFake( () => metadata.sectors[ 1 ] );
		metadata.getAdminArea.and.callFake( () => metadata.adminAreas[ 0 ] );
		metadata.getBarrierType.and.callFake( () => metadata.barrierTypes[ 1 ] );

		viewModel = proxyquire( modulePath, {
			'../../../lib/metadata': metadata,
			'../../../config': config,
			'../../../lib/strings': strings,
		} );
	} );

	describe( 'With all the data on an open barrier', () => {
		it( 'Should create all the correct properties', () => {

			inputBarrier.status.id = OPEN;
			inputBarrier.problem_status = '2';

			const output = viewModel( inputBarrier );
			const outputBarrier = output.barrier;
			const barrierSectors = inputBarrier.sectors.map( metadata.getSector );
			const openMetadata = metadata.barrier.status.typeInfo[ OPEN ];

			expect( outputBarrier.id ).toEqual( inputBarrier.id );
			expect( outputBarrier.code ).toEqual( inputBarrier.code );
			expect( outputBarrier.title ).toEqual( inputBarrier.barrier_title );
			expect( outputBarrier.product ).toEqual( inputBarrier.product );
			expect( outputBarrier.problem.status ).toEqual( metadata.statusTypes[ inputBarrier.problem_status ] );
			expect( outputBarrier.problem.description ).toEqual( inputBarrier.problem_description );
			expect( outputBarrier.types ).toEqual( [
				{ text: metadata.barrierTypes[ 1 ].title },
				{ text: metadata.barrierTypes[ 1 ].title },
				{ text: metadata.barrierTypes[ 1 ].title },
				{ text: metadata.barrierTypes[ 1 ].title },
			] );
			expect( outputBarrier.status ).toEqual( {
				name: openMetadata.name,
				modifier: openMetadata.modifier,
				date: inputBarrier.status.date,
				description: inputBarrier.status.summary,
				hint: openMetadata.hint,
			} );
			expect( outputBarrier.reportedOn ).toEqual( inputBarrier.reported_on );
			expect( outputBarrier.addedBy ).toEqual( inputBarrier.reported_by );
			expect( outputBarrier.location ).toEqual( strings.location.response );
			expect( strings.location ).toHaveBeenCalledWith( inputBarrier.export_country, [] );
			expect( outputBarrier.sectors ).toEqual( barrierSectors );
			expect( outputBarrier.source ).toEqual( {
				id: inputBarrier.source,
				name: metadata.barrierSource[ inputBarrier.source ],
				description: inputBarrier.other_source
			} );
			expect( outputBarrier.legal ).toEqual( {
				hasInfringements: ( inputBarrier.has_legal_infringement == '1' ),
				unknownInfringements: ( inputBarrier.has_legal_infringement == '3' ),
				infringements: {
					wto: inputBarrier.wto_infringement,
					fta: inputBarrier.fta_infringement,
					other: inputBarrier.other_infringement
				},
				summary: inputBarrier.infringement_summary
			} );
			expect( outputBarrier.priority ).toEqual( { ...inputBarrier.priority, modifier: inputBarrier.priority.code.toLowerCase() } );
			expect( outputBarrier.euExitRelated ).toEqual( 'A' );

			expect( output.sectorsList ).toEqual( barrierSectors.map( ( sector ) => ( { text: sector.name } ) ) );
			expect( output.companies ).toEqual( inputBarrier.companies );
			expect( output.companiesList ).toEqual( inputBarrier.companies.map( ( company ) => ( { text: company.name } ) ) );
		} );
	} );

	describe( 'With admin areas on an open barrier', () => {
		it( 'Should create all the correct properties', () => {

			inputBarrier.country_admin_areas = ['3456'];

			const output = viewModel( inputBarrier );
			const outputBarrier = output.barrier;

			expect( outputBarrier.location ).toEqual( strings.location.response );
			expect( strings.location ).toHaveBeenCalledWith( inputBarrier.export_country, inputBarrier.country_admin_areas );
		});
	});

	describe( 'With sectors missing on an open barrier', () => {
		it( 'Should create all the correct properties', () => {

			inputBarrier.status.id = OPEN;
			inputBarrier.sectors = null;

			const output = viewModel( inputBarrier );
			const outputBarrier = output.barrier;

			expect( outputBarrier.sectors ).toEqual( [] );
			expect( output.sectorsList ).toEqual( [] );

			expect( outputBarrier.isOpen ).toEqual( true );
			expect( outputBarrier.isResolved ).toEqual( false );
			expect( outputBarrier.isHibernated ).toEqual( false );
		} );
	} );

	describe( 'When getSector does not match the sector on an open barrier', () => {
		it( 'Should create all the correct properties', () => {

			metadata.getSector.and.callFake( () => null );

			inputBarrier.status.id = OPEN;
			inputBarrier.sectors = [ null ];

			const output = viewModel( inputBarrier );
			const outputBarrier = output.barrier;

			expect( outputBarrier.sectors ).toEqual( [ null ] );
			expect( output.sectorsList ).toEqual( [ { text: 'Unknown' } ] );
		} );
	} );

	describe( 'With barrier_type missing', () => {
		it( 'Should create all the correct properties', () => {

			inputBarrier.barrier_types = null;

			const output = viewModel( inputBarrier );
			const outputBarrier = output.barrier;

			expect( outputBarrier.types ).toEqual( [] );
		} );
	} );

	describe( 'With companies missing', () => {
		it( 'Should create all the correct properties', () => {

			delete inputBarrier.companies;

			const output = viewModel( inputBarrier );
			const outputBarrier = output.barrier;

			expect( outputBarrier.companies ).toEqual();
		} );
	} );

	describe( 'A fully resolved barrier', () => {
		it( 'Should have the correct properties', () => {

			inputBarrier.status.id = RESOLVED;

			const output = viewModel( inputBarrier );
			const outputBarrier = output.barrier;
			const resolvedMetadata = metadata.barrier.status.typeInfo[ RESOLVED ];

			expect( outputBarrier.status ).toEqual( {
				name: resolvedMetadata.name,
				modifier: resolvedMetadata.modifier,
				date: inputBarrier.status.date,
				description: inputBarrier.status.summary,
				hint: resolvedMetadata.hint,
			} );

			expect( outputBarrier.isOpen ).toEqual( false );
			expect( outputBarrier.isResolved ).toEqual( true );
			expect( outputBarrier.isPartiallyResolved ).toEqual( false );
			expect( outputBarrier.isHibernated ).toEqual( false );
		} );
	} );

	describe( 'A partially resolved barrier', () => {
		it( 'Should have the correct properties', () => {

			inputBarrier.status.id = PART_RESOLVED;

			const output = viewModel( inputBarrier );
			const outputBarrier = output.barrier;
			const partResolvedMetadata = metadata.barrier.status.typeInfo[ PART_RESOLVED ];

			expect( outputBarrier.status ).toEqual( {
				name: partResolvedMetadata.name,
				modifier: partResolvedMetadata.modifier,
				date: inputBarrier.status.date,
				description: inputBarrier.status.summary,
				hint: partResolvedMetadata.hint,
			} );

			expect( outputBarrier.isOpen ).toEqual( false );
			expect( outputBarrier.isResolved ).toEqual( true );
			expect( outputBarrier.isPartiallyResolved ).toEqual( true );
			expect( outputBarrier.isHibernated ).toEqual( false );
		} );
	} );

	describe( 'A barrier with no eu exit relation', () => {
		it( 'Should have the correct properties', () => {

			inputBarrier.eu_exit_related = null;

			const output = viewModel( inputBarrier );
			const outputBarrier = output.barrier;

			expect( outputBarrier.euExitRelated ).toEqual( 'Unknown' );
		} );
	} );

	describe( 'When all sectors is selected', () => {
		it( 'Should have the correct properties', () => {

			inputBarrier.all_sectors = true;

			const output = viewModel( inputBarrier );
			const sectorsList = output.sectorsList;

			expect( sectorsList ).toEqual( [ { text: 'All sectors' } ] );
		});
	});

	describe( 'A hibernated barrier', () => {
		it( 'Should have the correct properties', () => {

			inputBarrier.status.id = 5;

			const output = viewModel( inputBarrier );
			const outputBarrier = output.barrier;
			const hibernatedMetadata = metadata.barrier.status.typeInfo[ HIBERNATED ];

			expect( outputBarrier.status ).toEqual( {
				name: hibernatedMetadata.name,
				modifier: hibernatedMetadata.modifier,
				date: inputBarrier.status.date,
				description: inputBarrier.status.summary,
				hint: hibernatedMetadata.hint,
			} );

			expect( outputBarrier.isOpen ).toEqual( false );
			expect( outputBarrier.isResolved ).toEqual( false );
			expect( outputBarrier.isPartiallyResolved ).toEqual( false );
			expect( outputBarrier.isHibernated ).toEqual( true );
		} );
	} );

	describe( 'addCompany flag', () => {
		describe( 'When it is true', () => {
			it( 'Should set addCompany to true', () => {

				const output = viewModel( inputBarrier, true );

				expect( output.addCompany ).toEqual( true );
			} );
		} );

		describe( 'When it is false', () => {
			it( 'Should set addCompany to true', () => {

				const output = viewModel( inputBarrier, false );

				expect( output.addCompany ).toEqual( false );
			} );
		} );
	} );
} );
