var _dec, _dec2, _dec3, _dec4, _class, _desc, _value, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14;

function _initDefineProp(target, property, descriptor, context) {
	if (!descriptor) return;
	Object.defineProperty(target, property, {
		enumerable: descriptor.enumerable,
		configurable: descriptor.configurable,
		writable: descriptor.writable,
		value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
	});
}

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
	var desc = {};
	Object['ke' + 'ys'](descriptor).forEach(function (key) {
		desc[key] = descriptor[key];
	});
	desc.enumerable = !!desc.enumerable;
	desc.configurable = !!desc.configurable;

	if ('value' in desc || desc.initializer) {
		desc.writable = true;
	}

	desc = decorators.slice().reverse().reduce(function (desc, decorator) {
		return decorator(target, property, desc) || desc;
	}, desc);

	if (context && desc.initializer !== void 0) {
		desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
		desc.initializer = undefined;
	}

	if (desc.initializer === void 0) {
		Object['define' + 'Property'](target, property, desc);
		desc = null;
	}

	return desc;
}

function _initializerWarningHelper(descriptor, context) {
	throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
}

function PagingStrategyException(msg) {
	this.message = '[PagingStrategy] - ' + msg;
	this.name = 'PagingStrategyException';
}

export let PagingStrategy = class PagingStrategy {
	constructor(options) {
		let missingArgs = !options.sourcePromise || !options.itemsKey || !options.countKey;

		if (missingArgs) {
			throw new PagingStrategyException('Missing required arguments');
		}

		this.originalContext = options.context;
		this.sourcePromise = options.sourcePromise;
		this.itemsKey = options.itemsKey;
		this.countKey = options.countKey;
		this.pagingKey = options.pagingKey;
	}
};

import { customElement, bindable, inject, computedFrom } from 'aurelia-framework';

const METHOD = {
	POST: 'post',
	GET: 'get'
};

const SORT_ORDER = {
	ASC: 'asc',
	DESC: 'desc'
};

const PAGER_DEFAULTS = {
	pageNumber: 1,
	pageSize: 10,
	limit: 100,
	sortOrder: SORT_ORDER.DESC,
	dataset: null,
	pad: 2,
	showControlsAbove: true,
	showControlsBelow: true,
	localMode: false,
	pagingStrategy: null,
	requireMultiplePages: true,
	showStatusLine: true,
	showAdvancedControls: false
};

let Pager = (_dec = customElement('pager'), _dec2 = inject(Element), _dec3 = computedFrom('numPages', 'requireMultiplePages'), _dec4 = computedFrom('numPages', 'pageNumber', 'pageSize'), _dec(_class = _dec2(_class = (_class2 = class Pager {

	constructor(element) {
		_initDefineProp(this, 'pageNumber', _descriptor, this);

		_initDefineProp(this, 'pageSize', _descriptor2, this);

		_initDefineProp(this, 'limit', _descriptor3, this);

		_initDefineProp(this, 'sortOrder', _descriptor4, this);

		_initDefineProp(this, 'dataset', _descriptor5, this);

		_initDefineProp(this, 'pad', _descriptor6, this);

		_initDefineProp(this, 'showControlsAbove', _descriptor7, this);

		_initDefineProp(this, 'showControlsBelow', _descriptor8, this);

		_initDefineProp(this, 'localMode', _descriptor9, this);

		_initDefineProp(this, 'pagingStrategy', _descriptor10, this);

		_initDefineProp(this, 'requireMultiplePages', _descriptor11, this);

		_initDefineProp(this, 'showStatusLine', _descriptor12, this);

		_initDefineProp(this, 'showAdvancedControls', _descriptor13, this);

		_initDefineProp(this, 'onPageNav', _descriptor14, this);

		this.element = element;

		this.ready = false;

		this.setDefaults();
		this.clearState();
	}

	attached() {
		if (this.dataset) {
			this.masterDataset = this.dataset;
		}

		this.digest();
	}

	setDefaults() {
		let defaults = Object.keys(PAGER_DEFAULTS);
		defaults.forEach(key => {
			if (!this[key]) {
				this[key] = PAGER_DEFAULTS[key];
			}
		});

		this.isServerPaging = true;
		this.masterDataset = null;
	}

	pageNumberChanged(newVal, oldVal) {
		if (this.ready) {
			this.digestBecauseValueChanged();

			if (this.onPageNav) {
				this.onPageNav({
					previous: oldVal,
					current: newVal
				});
			}
		}
	}

	pageSizeChanged(newVal, oldVal) {
		if (this.ready) {
			this.setNumPages();
			this.digestBecauseValueChanged();
		}
	}

	get hasMultiplePages() {
		if (this.requireMultiplePages) {
			if (this.numPages <= 1) {
				return false;
			} else {
				return true;
			}
		}
		return true;
	}

	get statusLine() {
		let start = (this.pageNumber - 1) * this.pageSize + 1;
		let end = (this.pageNumber - 1) * this.pageSize + this.pageSize;

		if (end > this.totalCount) end = this.totalCount;

		return `Showing ${ start } to ${ end } of ${ this.totalCount } results`;
	}

	digest() {
		this.state.loading = true;
		if (!this.localMode && this.isServerPaging && this.pagingStrategy) {

			let thisPager = this;
			Promise.resolve(this.pagingStrategy.sourcePromise.call(this.pagingStrategy.originalContext)).then(result => {
				thisPager.masterDataset = result[thisPager.pagingStrategy.itemsKey];
				thisPager.totalCount = result[thisPager.pagingStrategy.countKey];
				thisPager.isServerPaging = result[thisPager.pagingStrategy.pagingKey];

				thisPager.setNumPages();

				thisPager.buildPagingModel();
			});
		} else {
			if (this.localMode) {
				this.totalCount = this.masterDataset.length;
				this.isServerPaging = false;
				this.setNumPages();
			}
			this.buildPagingModel();
		}
	}

	setNumPages() {
		this.numPages = Math.floor(this.totalCount / this.pageSize);

		if (this.totalCount / this.pageSize % 1 > 0) {
			this.numPages += 1;
		}

		if (this.pageNumber > this.numPages) {
			this.pageNumber = this.numPages;
		}
	}

	digestBecauseValueChanged() {
		setTimeout(() => {
			this.digest();
		});
	}

	select(btn) {
		this.pageNumber = Number(btn.text);
	}

	next() {
		this.pageNumber += 1;

		if (this.pageNumber > this.numPages) {
			this.pageNumber = this.numPages;
		}
	}

	prev() {
		this.pageNumber -= 1;

		if (this.pageNumber <= 0) {
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
		this.state.loading = true;
		this.state.enablePrevious = true;
		this.state.enableNext = true;
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
		this.buttonModel.lower.stop = this.numPages;

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
		if (this.buttonModel.inner.start !== -1 && this.buttonModel.inner.stop !== -1) {
			if (this.buttonModel.lower.stop + 1 >= this.buttonModel.inner.start) {
				this.buttonModel.lower.stop = this.buttonModel.inner.stop;
				this.buttonModel.inner.start = -1;
				this.buttonModel.inner.stop = -1;
				this.state.showLowerEllipsis = false;
			} else if (this.buttonModel.inner.stop + 1 >= this.buttonModel.upper.start) {
				this.buttonModel.upper.start = this.buttonModel.inner.start;
				this.buttonModel.inner.start = -1;
				this.buttonModel.inner.stop = -1;

				this.state.showUpperEllipsis = false;
			}
		}

		if (this.buttonModel.lower.stop + 1 >= this.buttonModel.upper.start) {
			this.setFullWidth();
		}
	}

	toggleDirectionButtons() {
		if (this.pageNumber === 1) {
			this.state.enablePrevious = false;
		}
		if (this.pageNumber === this.numPages) {
			this.state.enableNext = false;
		}
	}

	applyButtonModel() {
		this.state.loading = false;

		let buttons = [];
		Object.keys(this.buttonModel).forEach(key => {
			buttons.push({
				name: key,
				start: this.buttonModel[key].start,
				stop: this.buttonModel[key].stop
			});
		});

		this.setButtons(buttons);

		this.trimDataset();
	}

	buildPagingModel() {
		this.clearState();

		let min = this.pageNumber - this.pad;
		let max = this.pageNumber + this.pad;

		let shouldSetFullWidth = min <= 1 && max >= this.numPages;
		let shouldSetDoubleGap = min >= this.pad && max - 1 <= this.numPages - this.pad;
		let shouldSetLowerGapOnly = min >= this.pad && max >= this.numPages;
		let shouldSetUpperGapOnly = min <= 1 && max <= this.numPages - this.pad;

		if (shouldSetFullWidth) {
			this.setFullWidth();
		} else if (shouldSetDoubleGap) {
			this.setDoubleGap();
		} else if (shouldSetLowerGapOnly) {
			this.setLowerGapOnly();
		} else if (shouldSetUpperGapOnly) {
			this.setUpperGapOnly();
		}

		this.flattenButtonModelOverlap();
		this.toggleDirectionButtons();
		this.applyButtonModel();

		this.ready = true;
	}

	setButtons(slots) {
		slots.forEach(s => {
			this.addButtons(s);
		});
	}

	addButtons(slot) {
		if (slot.start === -1 || slot.stop === -1) {
			return;
		} else {
			for (let i = slot.start; i <= slot.stop; i++) {
				let button = {
					text: i,
					selected: this.pageNumber === i ? true : false
				};
				this.state.buttons[slot.name].push(button);
			}
		}
	}

	trimDataset() {
		if (this.localMode || !this.isServerPaging) {
			let lowerBound = this.pageSize * (this.pageNumber - 1);
			let upperBound = lowerBound + this.pageSize;

			this.dataset = this.masterDataset.slice(lowerBound, upperBound);
		} else {
			this.dataset = this.masterDataset;
		}
	}

	decreasePageSize() {
		this.pageSize--;
		if (this.pageSize < 1) {
			this.pageSize = 1;
		}
	}

	increasePageSize() {
		this.pageSize++;
		if (this.pageSize > this.totalCount) {
			this.pageSize = this.totalCount;
		}
	}
}, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'pageNumber', [bindable], {
	enumerable: true,
	initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'pageSize', [bindable], {
	enumerable: true,
	initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, 'limit', [bindable], {
	enumerable: true,
	initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, 'sortOrder', [bindable], {
	enumerable: true,
	initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, 'dataset', [bindable], {
	enumerable: true,
	initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, 'pad', [bindable], {
	enumerable: true,
	initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, 'showControlsAbove', [bindable], {
	enumerable: true,
	initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, 'showControlsBelow', [bindable], {
	enumerable: true,
	initializer: null
}), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, 'localMode', [bindable], {
	enumerable: true,
	initializer: null
}), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, 'pagingStrategy', [bindable], {
	enumerable: true,
	initializer: null
}), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, 'requireMultiplePages', [bindable], {
	enumerable: true,
	initializer: null
}), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, 'showStatusLine', [bindable], {
	enumerable: true,
	initializer: null
}), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, 'showAdvancedControls', [bindable], {
	enumerable: true,
	initializer: null
}), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, 'onPageNav', [bindable], {
	enumerable: true,
	initializer: null
}), _applyDecoratedDescriptor(_class2.prototype, 'hasMultiplePages', [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, 'hasMultiplePages'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'statusLine', [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, 'statusLine'), _class2.prototype)), _class2)) || _class) || _class);
export { Pager as default };