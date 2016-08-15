define(['exports', 'aurelia-framework'], function (exports, _aureliaFramework) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = exports.PagingStrategy = undefined;

	function _initDefineProp(target, property, descriptor, context) {
		if (!descriptor) return;
		Object.defineProperty(target, property, {
			enumerable: descriptor.enumerable,
			configurable: descriptor.configurable,
			writable: descriptor.writable,
			value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
		});
	}

	var _createClass = function () {
		function defineProperties(target, props) {
			for (var i = 0; i < props.length; i++) {
				var descriptor = props[i];
				descriptor.enumerable = descriptor.enumerable || false;
				descriptor.configurable = true;
				if ("value" in descriptor) descriptor.writable = true;
				Object.defineProperty(target, descriptor.key, descriptor);
			}
		}

		return function (Constructor, protoProps, staticProps) {
			if (protoProps) defineProperties(Constructor.prototype, protoProps);
			if (staticProps) defineProperties(Constructor, staticProps);
			return Constructor;
		};
	}();

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

	var _dec, _dec2, _dec3, _dec4, _class, _desc, _value, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14;

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	function PagingStrategyException(msg) {
		this.message = '[PagingStrategy] - ' + msg;
		this.name = 'PagingStrategyException';
	}

	var PagingStrategy = exports.PagingStrategy = function PagingStrategy(options) {
		_classCallCheck(this, PagingStrategy);

		var missingArgs = !options.sourcePromise || !options.itemsKey || !options.countKey;

		if (missingArgs) {
			throw new PagingStrategyException('Missing required arguments');
		}

		this.originalContext = options.context;
		this.sourcePromise = options.sourcePromise;
		this.itemsKey = options.itemsKey;
		this.countKey = options.countKey;
		this.pagingKey = options.pagingKey;
	};

	var METHOD = {
		POST: 'post',
		GET: 'get'
	};

	var SORT_ORDER = {
		ASC: 'asc',
		DESC: 'desc'
	};

	var PAGER_DEFAULTS = {
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

	var Pager = (_dec = (0, _aureliaFramework.customElement)('pager'), _dec2 = (0, _aureliaFramework.inject)(Element), _dec3 = (0, _aureliaFramework.computedFrom)('numPages', 'requireMultiplePages'), _dec4 = (0, _aureliaFramework.computedFrom)('numPages', 'pageNumber', 'pageSize'), _dec(_class = _dec2(_class = (_class2 = function () {
		function Pager(element) {
			_classCallCheck(this, Pager);

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

		Pager.prototype.attached = function attached() {
			if (this.dataset) {
				this.masterDataset = this.dataset;
			}

			this.digest();
		};

		Pager.prototype.setDefaults = function setDefaults() {
			var _this = this;

			var defaults = Object.keys(PAGER_DEFAULTS);
			defaults.forEach(function (key) {
				if (!_this[key]) {
					_this[key] = PAGER_DEFAULTS[key];
				}
			});

			this.isServerPaging = true;
			this.masterDataset = null;
		};

		Pager.prototype.pageNumberChanged = function pageNumberChanged(newVal, oldVal) {
			if (this.ready) {
				this.digestBecauseValueChanged();

				if (this.onPageNav) {
					this.onPageNav({
						previous: oldVal,
						current: newVal
					});
				}
			}
		};

		Pager.prototype.pageSizeChanged = function pageSizeChanged(newVal, oldVal) {
			if (this.ready) {
				this.setNumPages();
				this.digestBecauseValueChanged();
			}
		};

		Pager.prototype.digest = function digest() {
			var _this2 = this;

			this.state.loading = true;
			if (!this.localMode && this.isServerPaging && this.pagingStrategy) {
				(function () {

					var thisPager = _this2;
					Promise.resolve(_this2.pagingStrategy.sourcePromise.call(_this2.pagingStrategy.originalContext)).then(function (result) {
						thisPager.masterDataset = result[thisPager.pagingStrategy.itemsKey];
						thisPager.totalCount = result[thisPager.pagingStrategy.countKey];
						thisPager.isServerPaging = result[thisPager.pagingStrategy.pagingKey];

						thisPager.setNumPages();

						thisPager.buildPagingModel();
					});
				})();
			} else {
				if (this.localMode) {
					this.totalCount = this.masterDataset.length;
					this.isServerPaging = false;
					this.setNumPages();
				}
				this.buildPagingModel();
			}
		};

		Pager.prototype.setNumPages = function setNumPages() {
			this.numPages = Math.floor(this.totalCount / this.pageSize);

			if (this.totalCount / this.pageSize % 1 > 0) {
				this.numPages += 1;
			}

			if (this.pageNumber > this.numPages) {
				this.pageNumber = this.numPages;
			}
		};

		Pager.prototype.digestBecauseValueChanged = function digestBecauseValueChanged() {
			var _this3 = this;

			setTimeout(function () {
				_this3.digest();
			});
		};

		Pager.prototype.select = function select(btn) {
			this.pageNumber = Number(btn.text);
		};

		Pager.prototype.next = function next() {
			this.pageNumber += 1;

			if (this.pageNumber > this.numPages) {
				this.pageNumber = this.numPages;
			}
		};

		Pager.prototype.prev = function prev() {
			this.pageNumber -= 1;

			if (this.pageNumber <= 0) {
				this.pageNumber = 1;
			}
		};

		Pager.prototype.clearState = function clearState() {
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
		};

		Pager.prototype.setFullWidth = function setFullWidth() {
			this.buttonModel.lower.start = 1;
			this.buttonModel.lower.stop = this.numPages;

			this.buttonModel.inner.start = -1;
			this.buttonModel.inner.stop = -1;

			this.buttonModel.upper.start = -1;
			this.buttonModel.upper.stop = -1;

			this.state.showLowerEllipsis = false;
			this.state.showUpperEllipsis = false;
		};

		Pager.prototype.setDoubleGap = function setDoubleGap() {
			this.buttonModel.lower.start = 1;
			this.buttonModel.lower.stop = this.pad;

			this.buttonModel.inner.start = this.pageNumber - this.pad;
			this.buttonModel.inner.stop = this.pageNumber + this.pad;

			this.buttonModel.upper.start = this.numPages - this.pad + 1;
			this.buttonModel.upper.stop = this.numPages;

			this.state.showLowerEllipsis = true;
			this.state.showUpperEllipsis = true;
		};

		Pager.prototype.setLowerGapOnly = function setLowerGapOnly() {
			this.buttonModel.lower.start = 1;
			this.buttonModel.lower.stop = this.pad;

			this.buttonModel.upper.start = this.pageNumber - this.pad;
			this.buttonModel.upper.stop = this.numPages;

			this.state.showLowerEllipsis = true;
		};

		Pager.prototype.setUpperGapOnly = function setUpperGapOnly() {
			this.buttonModel.lower.start = 1;
			this.buttonModel.lower.stop = this.pageNumber + this.pad;

			this.buttonModel.upper.start = this.numPages - this.pad + 1;
			this.buttonModel.upper.stop = this.numPages;

			this.state.showUpperEllipsis = true;
		};

		Pager.prototype.flattenButtonModelOverlap = function flattenButtonModelOverlap() {
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
		};

		Pager.prototype.toggleDirectionButtons = function toggleDirectionButtons() {
			if (this.pageNumber === 1) {
				this.state.enablePrevious = false;
			}
			if (this.pageNumber === this.numPages) {
				this.state.enableNext = false;
			}
		};

		Pager.prototype.applyButtonModel = function applyButtonModel() {
			var _this4 = this;

			this.state.loading = false;

			var buttons = [];
			Object.keys(this.buttonModel).forEach(function (key) {
				buttons.push({
					name: key,
					start: _this4.buttonModel[key].start,
					stop: _this4.buttonModel[key].stop
				});
			});

			this.setButtons(buttons);

			this.trimDataset();
		};

		Pager.prototype.buildPagingModel = function buildPagingModel() {
			this.clearState();

			var min = this.pageNumber - this.pad;
			var max = this.pageNumber + this.pad;

			var shouldSetFullWidth = min <= 1 && max >= this.numPages;
			var shouldSetDoubleGap = min >= this.pad && max - 1 <= this.numPages - this.pad;
			var shouldSetLowerGapOnly = min >= this.pad && max >= this.numPages;
			var shouldSetUpperGapOnly = min <= 1 && max <= this.numPages - this.pad;

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
		};

		Pager.prototype.setButtons = function setButtons(slots) {
			var _this5 = this;

			slots.forEach(function (s) {
				_this5.addButtons(s);
			});
		};

		Pager.prototype.addButtons = function addButtons(slot) {
			if (slot.start === -1 || slot.stop === -1) {
				return;
			} else {
				for (var i = slot.start; i <= slot.stop; i++) {
					var button = {
						text: i,
						selected: this.pageNumber === i ? true : false
					};
					this.state.buttons[slot.name].push(button);
				}
			}
		};

		Pager.prototype.trimDataset = function trimDataset() {
			if (this.localMode || !this.isServerPaging) {
				var lowerBound = this.pageSize * (this.pageNumber - 1);
				var upperBound = lowerBound + this.pageSize;

				this.dataset = this.masterDataset.slice(lowerBound, upperBound);
			} else {
				this.dataset = this.masterDataset;
			}
		};

		Pager.prototype.decreasePageSize = function decreasePageSize() {
			this.pageSize--;
			if (this.pageSize < 1) {
				this.pageSize = 1;
			}
		};

		Pager.prototype.increasePageSize = function increasePageSize() {
			this.pageSize++;
			if (this.pageSize > this.totalCount) {
				this.pageSize = this.totalCount;
			}
		};

		_createClass(Pager, [{
			key: 'hasMultiplePages',
			get: function get() {
				if (this.requireMultiplePages) {
					if (this.numPages <= 1) {
						return false;
					} else {
						return true;
					}
				}
				return true;
			}
		}, {
			key: 'statusLine',
			get: function get() {
				var start = (this.pageNumber - 1) * this.pageSize + 1;
				var end = (this.pageNumber - 1) * this.pageSize + this.pageSize;

				if (end > this.totalCount) end = this.totalCount;

				return 'Showing ' + start + ' to ' + end + ' of ' + this.totalCount + ' results';
			}
		}]);

		return Pager;
	}(), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'pageNumber', [_aureliaFramework.bindable], {
		enumerable: true,
		initializer: null
	}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'pageSize', [_aureliaFramework.bindable], {
		enumerable: true,
		initializer: null
	}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, 'limit', [_aureliaFramework.bindable], {
		enumerable: true,
		initializer: null
	}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, 'sortOrder', [_aureliaFramework.bindable], {
		enumerable: true,
		initializer: null
	}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, 'dataset', [_aureliaFramework.bindable], {
		enumerable: true,
		initializer: null
	}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, 'pad', [_aureliaFramework.bindable], {
		enumerable: true,
		initializer: null
	}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, 'showControlsAbove', [_aureliaFramework.bindable], {
		enumerable: true,
		initializer: null
	}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, 'showControlsBelow', [_aureliaFramework.bindable], {
		enumerable: true,
		initializer: null
	}), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, 'localMode', [_aureliaFramework.bindable], {
		enumerable: true,
		initializer: null
	}), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, 'pagingStrategy', [_aureliaFramework.bindable], {
		enumerable: true,
		initializer: null
	}), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, 'requireMultiplePages', [_aureliaFramework.bindable], {
		enumerable: true,
		initializer: null
	}), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, 'showStatusLine', [_aureliaFramework.bindable], {
		enumerable: true,
		initializer: null
	}), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, 'showAdvancedControls', [_aureliaFramework.bindable], {
		enumerable: true,
		initializer: null
	}), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, 'onPageNav', [_aureliaFramework.bindable], {
		enumerable: true,
		initializer: null
	}), _applyDecoratedDescriptor(_class2.prototype, 'hasMultiplePages', [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, 'hasMultiplePages'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'statusLine', [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, 'statusLine'), _class2.prototype)), _class2)) || _class) || _class);
	exports.default = Pager;
});