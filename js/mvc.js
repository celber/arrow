function App() {};

App.Base = new Class({});

App.Observable = {
	addEvent: function (name) {
		if (!this.events) {
			this.events = {};
		}
		this.events[name] = this.events[name] || [];
	},
	addEventListener: function (event, handler) {
		//@chainable

		this.events[event].push(handler);
		return this;
	},
	removeEventListener: function (event, handler) {
		//@chainable
		var i,eventHandlers;
		if (this.events.hasOwnProperty(event)) {
			for(eventHandlers = this.events[event], i = eventHandlers.length-1; --i;){
				if (eventHandlers[i] === handler) array.splice(i, 1);
			}
		}
		
		return this;
	},
	fireEvent: function (event) {
		var me = this;
		var result = true;
	
		this.events[event].forEach(function (handler) {
			if (handler.call(me) === false) {
				result = false;
			}
		});

		return result;
	}
};

function EmptyFn () {};

App.Field = new Class({
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
		} else if (config.defaultValue) {
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

App.Model = new Class(App.Base);
App.Model.implement([App.Observable]);

App.Model.extend({
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
				defaultValue: (config.defaultvalues || {})[key]
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
		this.fields[field.name] = new App.Field(field);
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

App.View = new Class(App.Base);

App.View.extend({
	initialize: function (config) {
		config = config || {};
		this.init = config.init || EmptyFn;
		if (typeof config.el == "string") {
			this.el = document.querySelector(config.el);
		} else {
			this.el = config.el;
		}
		
		for (key in config) {
			this[key] = config[key];
		}
		this.init.call(this);
	}
});
App.View.implement([App.Observable]);

App.Controller = new Class(App.Base);

App.Controller.extend({
	initialize: function (config) {
		config = config || {};
		var key;
		
		this.init = config.init || EmptyFn;
		
		for (key in config) {
			this[key] = config[key];
		}	
		
		this.init.call(this);
	}
});
App.Controller.implement([App.Observable]);