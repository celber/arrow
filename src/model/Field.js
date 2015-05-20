App.model = App.model || {};

App.model.Field = new Class({
	initialize: function (config) {
		config = config || {};
		
		this.name = config.name;
		if (config.setter) {
			this.setter = config.setter;
		}
		if (config.getter) {
			this.getter = config.getter;
		}
		
		if (config.value) {
			this.setValue(config.value);
		} else if (config.defaultValue !== undefined) {
			this.value = config.defaultValue;
		} else {
			this.setValue(null);
		}
	},
	getValue: function () {
		if (this.hasOwnProperty('getter')) {	
			return this.getter.call(this, this.value);
		} else {
			return this.value;
		}
	},
	getRawValue: function () {
		return this.value;
	},
	setValue: function (value) {
		if (this.hasOwnProperty('setter')) {	
			return this.setter.call(this, value);
		} else {
			return this.setRawValue(value);
		}
	},
	setRawValue: function (value) {
		return this.value = value;
	}
});
