const metadata = require( '../lib/metadata' );
const sortGovukItems = require( '../lib/sort-govuk-items' );
const urls = require( '../lib/urls' );
const strings = require( '../lib/strings' );
const barrierFilters = require( '../lib/barrier-filters' );

const { OPEN, RESOLVED, HIBERNATED } = metadata.barrier.status.types;
const barrierStatusTypeInfo = metadata.barrier.status.typeInfo;

function createMatcher( key ){

	return function matcher( values = [] ){

		return ( item ) => {

			const value = String( item.value ); // query params are always strings so cast value to a string to ensure they match numbers etc

			if( values.includes( value ) ){ // .includes uses Same-value-zero equality matching

				item[ key ] = true;
			}

			return item;
		};
	};
}

//const isSelected = createMatcher( 'selected' );
const isChecked = createMatcher( 'checked' );

module.exports = function( { count, barriers, filters, queryString, isEdit, editListIndex, filtersMatchEditList } ){

	const barrierList = [];
	const hasFilters = !!Object.keys( filters ).length;

	function getRemoveUrl( filters, key ){

		const clone = { ...filters };

		delete clone[ key ];

		if( isEdit ){

			clone.editList = editListIndex;
		}

		return urls.findABarrier( clone );
	}

	for( let barrier of barriers ){

		const sectors = ( barrier.sectors && barrier.sectors.map( metadata.getSector ) || [] );
		const barrierStatusCode = barrier.status.id;
		const status = barrierStatusTypeInfo[ barrierStatusCode ] || {};

		barrierList.push( {
			id: barrier.id,
			code: barrier.code,
			title: barrier.barrier_title,
			isOpen: ( barrierStatusCode === OPEN ),
			isResolved: ( barrierStatusCode === RESOLVED ),
			isHibernated: ( barrierStatusCode === HIBERNATED ),
			location: strings.location( barrier.export_country, barrier.country_admin_areas ),
			sectors,
			sectorsList: sectors.map( ( sector ) => sector.name ),
			status,
			priority: barrier.priority,
			date: {
				reported: barrier.reported_on,
				status: barrier.status.date,
				created: barrier.created_on,
			}
		} );
	}

	const countries = metadata.getCountryList( 'All locations' );
	countries.forEach( ( country ) => { // forEach does not get affected by pushing new elements into the array

		const name = country.text;
		const id = country.value;
		const adminAreas = metadata.adminAreasByCountry[ id ];

		if( adminAreas ){

			const adminList = adminAreas.map( ( adminArea ) => ({ value: adminArea.id, text: `${ name } > ${ adminArea.name }` } ) );
			countries.push( ...adminList );
		}
	} );

	return {
		count,
		barriers: barrierList,
		hasFilters,
		queryString,
		showSaveButton: ( isEdit ? !filtersMatchEditList : hasFilters ),
		isEdit,
		editListIndex,
		filterParams: filters,
		removeAllUrl: urls.findABarrier( ( isEdit ? { editList: editListIndex } : {} ) ),
		filters: {
			country: {
				...barrierFilters.getDisplayInfo( 'country', filters.country ),
				items: countries.sort( sortGovukItems.alphabetical ).map( isChecked( filters.country ) ),
				active: !!filters.country,
				removeUrl: getRemoveUrl( filters, 'country' ),
			},
			region: {
				...barrierFilters.getDisplayInfo( 'region', filters.region ),
				items: metadata.getOverseasRegionList( 'All regions' ).map( isChecked( filters.region ) ),
				active: !!filters.region,
				removeUrl: getRemoveUrl( filters, 'region' ),
			},
			sector: {
				...barrierFilters.getDisplayInfo( 'sector', filters.sector ),
				items: metadata.getSectorList( 'All sectors' ).map( isChecked( filters.sector ) ),
				active: !!filters.sector,
				removeUrl: getRemoveUrl( filters, 'sector' ),
			},
			type: {
				...barrierFilters.getDisplayInfo( 'type', filters.type ),
				items: metadata.getBarrierTypeList().sort( sortGovukItems.alphabetical ).map( isChecked( filters.type ) ),
				active: !!filters.type,
				removeUrl: getRemoveUrl( filters, 'type' ),
			},
			priority: {
				...barrierFilters.getDisplayInfo( 'priority', filters.priority ),
				items: metadata.getBarrierPrioritiesList( { suffix: false } ).map( isChecked( filters.priority ) ),
				active: !!filters.priority,
				removeUrl: getRemoveUrl( filters, 'priority' ),
			},
			search: {
				...barrierFilters.getDisplayInfo( 'search', filters.search ),
				active: !!filters.search,
				removeUrl: getRemoveUrl( filters, 'search' ),
			},
			status: {
				...barrierFilters.getDisplayInfo( 'status', filters.status ),
				items: metadata.getBarrierStatusList().map( isChecked( filters.status ) ),
				active: !!filters.status,
				removeUrl: getRemoveUrl( filters, 'status' ),
			},
			createdBy: {
				...barrierFilters.getDisplayInfo( 'createdBy', filters.createdBy ),
				items: metadata.getBarrierCreatedByList().map( isChecked( filters.createdBy ) ),
				active: !!filters.createdBy,
				removeUrl: getRemoveUrl( filters, 'createdBy' ),
			},
		}
	};
};
