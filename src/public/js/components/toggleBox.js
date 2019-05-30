ma.components.ToggleBox = (function( doc ){

	if( !jessie.hasFeatures( 'query', 'addClass', 'removeClass', 'bind', 'attachListener', 'getEventTarget' ) ){ return; }

	var addClass = jessie.addClass;
	var removeClass = jessie.removeClass;

	var CONTAINER_CLASS = 'toggle-box';
	var ELEMENT_T0_ATTACH = 'js-toggle-box-control';
	var CLOSED_CLASS = 'toggle-box--closed';
	var OPEN_CLASS = 'toggle-box--opened';
	var LABEL_CLASS = 'toggle-box__label button-as-link';

	var DEFAULT_TEXT_MORE = 'Show list filters';
	var DEFAULT_TEXT_LESS = 'Hide list filters';

	function ToggleBox( container, text ){

		if( !container ){ return; }

		this.container = container;
		this.text = {
			more: ( text && text.more || DEFAULT_TEXT_MORE ),
			less: ( text && text.less || DEFAULT_TEXT_LESS )
		};
		this.open = false;
		addClass( container, CLOSED_CLASS );

		this.label = doc.createElement( 'button' );
		this.label.className = LABEL_CLASS;
		this.label.innerText = this.text.more;

		var elementToAttach = doc.getElementsByClassName( ELEMENT_T0_ATTACH );
		elementToAttach[ 0 ].insertAdjacentElement( 'afterend', this.label );

		jessie.attachListener( this.label, 'click', jessie.bind( this.handleClick, this ) );
	}

	ToggleBox.prototype.handleClick = function(){

		var container = this.container;
		this.open = !this.open;

		addClass( container, ( this.open ? OPEN_CLASS : CLOSED_CLASS ) );
		removeClass( container, ( this.open ? CLOSED_CLASS: OPEN_CLASS ) );

		this.label.innerText = ( jessie.hasClass( container, OPEN_CLASS ) ? this.text.less : this.text.more );
	};

	ToggleBox.init = function(){

		var widgets = jessie.query( '.' + CONTAINER_CLASS );
		var i = 0;
		var widget;

		while( ( widget = widgets[ i++ ] ) ){
			new ToggleBox( widget );
		}
	};

	return ToggleBox;
}( document ));
