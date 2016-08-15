/*
	----------------------------------
	Pager custom element
	----------------------------------

	Usage:

		Paging via segmented server call
		--------------------------------

			1) Include PagingStrategy
			import {PagingStrategy} from 'lib/customElements/pager/pager';

			2) Define PagingStrategy
			this.pagingStrategy = new PagingStrategy( { context: this, sourcePromise: this.executeSearch, itemsKey: 'items', countKey: 'totalCount', pagingKey: 'isPaged' } );

			3) Bind to necessary variables and define a promise to return an array of items
	
			this.serverPagedDataset = [];
			this.pageSize = 5;
			this.pageNumber = 2;
			this.limit = 10;

			// This is just and example.  You should define this yourself
			getData() {
				let query = {
					term:       null,
					pageSize:   this.pageSize,
					limit:      this.limit,
					pageNumber: this.pageNumber
				};

				return this.http.post( this.organizationInfoEndpoint, query )
					.then( response => response.json() )
					.then( data => {
						return data;
				});
			}

			4) Create a view
			<pager paging-strategy.bind="pagingStrategy" page-size.two-way="pageSize" page-number.two-way="pageNumber" limit.two-way="limit" dataset.two-way="serverPagedDataset">
				<template replace-part="pager-view">
					<div style="margin-left: 30px">
						<div repeat.for="item of serverPagedDataset">
							${item.name}
						</div>
					</div>
				</template>
			</pager>


		Paging via local dataset
		----------------------
			<pager page-size.bind="5" local-mode.bind="true" dataset.two-way="items">
		    	<template replace-part="pager-view">
					<div repeat.for="item of items">
						${item.name}
					</div>
		    	</template>
			</pager>


		Paging with custom loading template
		-----------------------------------
			<pager local-mode.bind="true" dataset.two-way="items">
				<template replace-part="loading-view"> I haz cheez </template>
				<template replace-part="pager-view">
					<div repeat.for="item of items">
						${item.name}
					</div>
				</template>
			</page>


	Bindable properties:

		pageNumber: 			[number] current page number

		pageSize: 				[number] number of items per page

		limit: 					[number] the server will begin returing paged
								records to the client if there are more
								than {limit} records to return, otherwise
								it will return the entire data set
		
		sortOrder: 				[SORT_ORDER] order to display records - see SORT_ORDER constant

		dataset: 				[array] reference to pages of items retrieved by the pager
								this will behave the same way when localMode is set
								to true or false
		
		pad: 					[number] number of page buttons worth of padding (from the
								selected page) on the pager ui when paging through data
		
		showControlsAbove: 		[boolean] render paging ui above pager view
		
		showControlsBelow: 		[boolean] render paging ui below pager view

		pagingStrategy:     	[PagingStrategy] object defining the stategy for speaking
								with a data source see [PagingStrategy]

		requireMultiplePages: 	[boolean] only show paging controls if this is true

		showStatusLine:     	[boolean] show the status line
								"Showing x to y of z results"

		showAdvancedControls: 	[boolean] show page size controls


	Replaceable template Parts:
		
		loading-view: 	This view is for rendering a loading indicator.
						By default the text 'Loading...' is displayed
						when the pager is fetching a page from the server

		pager-view: 	This view is for rendering paged items.
						The dataset property references items on the current page.
						
						In the case where the server is not paging or the pager is
						running in local mode, the masterDataset will contain all
						items in the collection (not just the current page).

*/

function PagingStrategyException( msg ) {
	this.message = '[PagingStrategy] - ' + msg;
	this.name = 'PagingStrategyException';
}

/*
	----------------------------------
	PagingStrategy
	----------------------------------

	A paging strategy will define the relationship between a pager 
	and a data source.  The data source can be anything you would like it
	to be so long as the pager strategy can describe it.

	Options:

		originalContext: 	[Object] 'this' value of the class or function where the [sourcePromise]
							is defined.

		sourcePromise: 		[Promise] that resolves an [Object] containing 
								1) array of items to be paged
								2) the total number of items in this collection
								3) wether or not the server is paging these items (or it returned them all)

		itemsKey: 			[String] the property name the cooresponds to (1) array of items to be paged
							on the object resolved by the [sourcePromise]

		countKey: 			[String] the property name the cooresponds to (2) the total number of items in this collection
							on the object resolved by the [sourcePromise]

		pagingKey: 			[String] the property name the cooresponds to (3) wether or not the server is paging these items
							on the object resolved by the [sourcePromise]

*/
export class PagingStrategy {
	constructor( options ) {
		let missingArgs = !options.sourcePromise || !options.itemsKey || !options.countKey;

		if( missingArgs ) {
			throw new PagingStrategyException( 'Missing required arguments' );
		}

		this.originalContext = options.context;
		this.sourcePromise   = options.sourcePromise;
		this.itemsKey        = options.itemsKey;
		this.countKey        = options.countKey;
		this.pagingKey       = options.pagingKey;
	}
}

import {customElement, bindable, inject, computedFrom} from 'aurelia-framework';

const METHOD = {
	POST: 'post',
	GET:  'get'
};

const SORT_ORDER = {
	ASC:  'asc',
	DESC: 'desc'
};

const PAGER_DEFAULTS = {
	pageNumber:           1,
	pageSize:             10,
	limit:                100,
	sortOrder:            SORT_ORDER.DESC,
	dataset:              null,
	pad:                  2,
	showControlsAbove:    true,
	showControlsBelow:    true,
	localMode:            false,
	pagingStrategy:       null,
	requireMultiplePages: true,
	showStatusLine:       true,
	showAdvancedControls: false
};

@customElement('pager')
@inject(Element)
export default class Pager {
	@bindable pageNumber; 			// view: page-number
	@bindable pageSize;   			// view: page-size
	@bindable limit;
	@bindable sortOrder;  			// view: sort-order
	@bindable dataset;
	@bindable pad;
	@bindable showControlsAbove;	// view: show-controls-above
	@bindable showControlsBelow;	// view: show-controls-below
	@bindable localMode;			// view: local-mode
	@bindable pagingStrategy;       // view: paging-strategy
	@bindable requireMultiplePages; // view: require-multiple-pages
	@bindable showStatusLine;       // view: show-status-line
	@bindable showAdvancedControls; // view: show-advanced-controls
	@bindable onPageNav;

	constructor( element ) {
		this.element = element;

		// pager is ready once it has completed buildPagingModel() at least once
		// can be used to hide the pager until it has built its button model
		this.ready = false; 	
		
		this.setDefaults();
		this.clearState();
	}

	attached() {
		/* 
			if dataset was bound, let masterDataset reference it 
				- this will help manage the cases where localMode is
				  set to true of the server is not paging
		*/
		if( this.dataset ) {
			this.masterDataset = this.dataset;
		}

		this.digest();
	}

	setDefaults() {
		let defaults = Object.keys( PAGER_DEFAULTS );
		defaults.forEach( key => {
			if( !this[key] ) {
				this[key] = PAGER_DEFAULTS[key];
			}
		});

		/* 
			Assume server is paging data
			until it says otherwise.
		*/
		this.isServerPaging = true;
		this.masterDataset  = null;
	}

	pageNumberChanged( newVal, oldVal ) {
		if( this.ready ) {
			this.digestBecauseValueChanged();

			if( this.onPageNav ) {
				this.onPageNav({
					previous: oldVal,
					current: newVal
				});
			}
		}
	}

	pageSizeChanged( newVal, oldVal ) {
		if( this.ready ) {
			this.setNumPages();
			this.digestBecauseValueChanged();
		}
	}

	@computedFrom('numPages', 'requireMultiplePages')
	get hasMultiplePages() {
		if( this.requireMultiplePages ) {
			if( this.numPages <= 1 ) {
				return false;
			} else {
				return true;
			}
		}
		return true;
	}

	@computedFrom('numPages','pageNumber','pageSize')
	get statusLine() {
		let start = (this.pageNumber - 1) * this.pageSize + 1;
		let end = (this.pageNumber - 1) * this.pageSize + this.pageSize;

		if( end > this.totalCount ) end = this.totalCount;

		return `Showing ${start} to ${end} of ${this.totalCount} results`;
	}

	digest() {
		this.state.loading = true;
		if( !this.localMode && this.isServerPaging && this.pagingStrategy ) {

			/*
				Bewares: switch context here to execute a promise in it's original context to fetch 
				paging data for this pager.  switch back to the pager context to apply the strategy
			*/

			let thisPager = this;
			Promise.resolve( this.pagingStrategy.sourcePromise.call( this.pagingStrategy.originalContext ) )
				.then( result => {
					thisPager.masterDataset  = result[thisPager.pagingStrategy.itemsKey];
					thisPager.totalCount     = result[thisPager.pagingStrategy.countKey];
					thisPager.isServerPaging = result[thisPager.pagingStrategy.pagingKey];

					thisPager.setNumPages();

					thisPager.buildPagingModel();
				});

		} else {
			if( this.localMode ) {
				this.totalCount = this.masterDataset.length;
				this.isServerPaging = false;
				this.setNumPages();
			}
			this.buildPagingModel();
		}
	}

	setNumPages() {
		this.numPages = Math.floor(this.totalCount / this.pageSize);

		if( (this.totalCount/this.pageSize) % 1 > 0 ) {
			this.numPages += 1;
		}

		if( this.pageNumber > this.numPages ) {
			this.pageNumber = this.numPages;
		}
	}

	digestBecauseValueChanged() {
		/*
			setTimeout is required here because the pageNumber
			will be two-way bound when the pager is being used to 
			page data coming from an asynchronous source. 

			In order for the value of pageNumber to be the same
			in the pager and any view model that contains 
			a PagingStrategy, we must wait until the 
			next pass of the js execution loop and give 
			aurelia the oportunity to update.
		*/
		setTimeout( () => {
			this.digest();
		});
	}

	select( btn ) {
		this.pageNumber = Number(btn.text);
	}

	next() {
		this.pageNumber += 1;

		if( this.pageNumber > this.numPages ) {
			this.pageNumber = this.numPages;
		}
	}

	prev() {
		this.pageNumber -= 1;

		if( this.pageNumber <=0 ) {
			this.pageNumber = 1;
		}
	}

	clearState() {
		this.state = {};
		this.state.buttons = {
			lower: [],
			inner: [],
			upper: []
		};
		this.state.loading			 = true;
		this.state.enablePrevious    = true;
		this.state.enableNext        = true;
		this.state.showLowerEllipsis = false;
		this.state.showUpperEllipsis = false;

		this.buttonModel = {
			lower: {
				start: -1,
				stop: -1
			},
			inner: {
				start: -1,
				stop: -1
			},
			upper: {
				start: -1,
				stop: -1
			}
		};
	}

	setFullWidth() {
		this.buttonModel.lower.start = 1;
		this.buttonModel.lower.stop  = this.numPages;

		this.buttonModel.inner.start = -1;
		this.buttonModel.inner.stop = -1;

		this.buttonModel.upper.start = -1;
		this.buttonModel.upper.stop = -1;

		this.state.showLowerEllipsis = false;
		this.state.showUpperEllipsis = false;
	}

	setDoubleGap() {
		this.buttonModel.lower.start = 1;
		this.buttonModel.lower.stop = this.pad;

		this.buttonModel.inner.start = this.pageNumber - this.pad;
		this.buttonModel.inner.stop = this.pageNumber + this.pad;

		this.buttonModel.upper.start = this.numPages - this.pad + 1;
		this.buttonModel.upper.stop = this.numPages;

		this.state.showLowerEllipsis = true;
		this.state.showUpperEllipsis = true;
	}

	setLowerGapOnly() {
		this.buttonModel.lower.start = 1;
		this.buttonModel.lower.stop = this.pad;

		this.buttonModel.upper.start = this.pageNumber - this.pad;
		this.buttonModel.upper.stop = this.numPages;

		this.state.showLowerEllipsis = true;
	}

	setUpperGapOnly() {
		this.buttonModel.lower.start = 1;
		this.buttonModel.lower.stop = this.pageNumber + this.pad;

		this.buttonModel.upper.start = this.numPages - this.pad + 1;
		this.buttonModel.upper.stop = this.numPages;

		this.state.showUpperEllipsis = true;
	}

	flattenButtonModelOverlap() {
		/* check for inner overlaps */
		if( this.buttonModel.inner.start !== -1 && this.buttonModel.inner.stop !== -1 ) {
			if( this.buttonModel.lower.stop + 1 >= this.buttonModel.inner.start ) {
				// join lower and inner
				this.buttonModel.lower.stop = this.buttonModel.inner.stop;
				this.buttonModel.inner.start = -1;
				this.buttonModel.inner.stop = -1;
				this.state.showLowerEllipsis = false;
			} else if( this.buttonModel.inner.stop + 1 >= this.buttonModel.upper.start ) {
				// join inner and upper
				this.buttonModel.upper.start = this.buttonModel.inner.start;
				this.buttonModel.inner.start = -1;
				this.buttonModel.inner.stop = -1;

				this.state.showUpperEllipsis = false;
			}
		}

		/* check for full overlap */
		if( this.buttonModel.lower.stop + 1 >= this.buttonModel.upper.start ) {
			this.setFullWidth();
		}
	}

	toggleDirectionButtons() {
		if( this.pageNumber === 1 ) {
			this.state.enablePrevious = false;
		}
		if( this.pageNumber === this.numPages ) {
			this.state.enableNext = false;
		}
	}

	applyButtonModel() {
		this.state.loading = false;
		
		let buttons = [];
		Object.keys( this.buttonModel ).forEach( key => {
			buttons.push({
				name: key,
				start: this.buttonModel[key].start,
				stop: this.buttonModel[key].stop
			});
		});

		this.setButtons( buttons );

		this.trimDataset();
	}

	buildPagingModel() {
		this.clearState();

		let min = this.pageNumber - this.pad;
		let max = this.pageNumber + this.pad;

		let shouldSetFullWidth    = min <= 1 && max >= this.numPages;
		let shouldSetDoubleGap    = min >= this.pad && max - 1 <= this.numPages - this.pad;
		let shouldSetLowerGapOnly = min >= this.pad && max >= this.numPages;
		let shouldSetUpperGapOnly = min <= 1 && max <= this.numPages - this.pad;

		if( shouldSetFullWidth ) 			{ this.setFullWidth(); }
		else if( shouldSetDoubleGap ) 		{ this.setDoubleGap(); }
		else if( shouldSetLowerGapOnly ) 	{ this.setLowerGapOnly(); }
		else if( shouldSetUpperGapOnly ) 	{ this.setUpperGapOnly(); }

		this.flattenButtonModelOverlap();
		this.toggleDirectionButtons();
		this.applyButtonModel();

		this.ready = true;
	}

	setButtons( slots ) {
		slots.forEach( s => {
			this.addButtons( s );
		});
	}

	addButtons( slot ) {
		if( slot.start === -1 || slot.stop === -1 ) {
			return;
		} else {
			for( let i=slot.start; i<=slot.stop; i++ ) {
				let button = {
					text: i,
					selected: this.pageNumber === i ? true : false
				};
				this.state.buttons[slot.name].push( button );
			}
		}
	}

	trimDataset() {
		if( this.localMode || !this.isServerPaging ) {
			/* Page size is smaller than master dataset size */
			let lowerBound = this.pageSize * (this.pageNumber - 1);
			let upperBound = lowerBound + this.pageSize;

			this.dataset = this.masterDataset.slice( lowerBound, upperBound );
		} else {
			this.dataset = this.masterDataset;
		}
	}

	decreasePageSize() {
		/* page size cannot be less than one */
		this.pageSize--;
		if( this.pageSize < 1 ) {
			this.pageSize = 1;
		}
	}

	increasePageSize() {
		/* page size cannot be more that total number of items */
		this.pageSize++;
		if( this.pageSize > this.totalCount ) {
			this.pageSize = this.totalCount;
		}
	}
}