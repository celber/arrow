App.model = App.model || {};

App.model.Model = new Class(App.Base);
App.model.Model.implement([App.Observable]);

App.model.Model.extend({
	initialize: function (config) {
		config = config || {};
		var idx;
		var key;
		
		this.addEvent("update");
		
		for (idx in config.fields) {
			key = config.fields[idx];
			this.addField({
				name: key,
				setter: (config.setters || {})[key],
				getter: (config.getters || {})[key],
				defaultValue: (config.defaultValues || {})[key]
			});
		}
		
		if (config.data) {
			this.setData(config.data, true);
		}
	},
	addField: function (field) {
		if (!this.fields) {
			this.fields = {};
		}
		this.fields[field.name] = new App.model.Field(field);
	},
	setValue: function (name, value, silent) {
		var field;
		
		if (this.fields.hasOwnProperty(name)) {
			field = this.fields[name]; 
		} else {
			throw "field does not exist";
		}
		
		value = field.setValue(value);
		
		if (!silent) {
			this.fireEvent('update');
		}
		
		return value;
	},
	setRawVaue: function (name, value, silent) {
		if (this.fields.hasOwnProperty(name)) {
			field = this.fields[name]; 
		} else {
			throw "field does not exist";
		}
		
		this.fields[name].setRawValue(value);
		if (!silent) {
			this.fireEvent('update');
		}
		return value;
	},
	getValue: function (name) {
		var field = this.fields[name];
		return field.getValue();
	},
	getRawValue: function (name) {
		return this.fields[name].getRawValue();
	},
	setData: function (data, silent) {
		//@chainable
		var key;
		for (key in data) {
			this.setValue(key, data[key], silent);
		}
		return this;
	},
	setRawValue: function (data) {
		//@chainable
		var key;
		for (key in data) {
			this.setRawValue(key, data[name]);
		}
		return this;
	},
	beforeUpdate: function () {
		//@template
		//do here additional changes before 'update' is fired
	}
});
