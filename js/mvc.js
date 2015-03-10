function EmptyFn () {};

function Field (config) {
	config = config || {};
	
	this.name = config.name;
	if (config.setter) {
		this.setter = config.setter;
	}
	if (config.getter) {
		this.getter = config.getter;
	}
	if (config.defaultValue) {
		this.value = config.defaultValue;
	}
}

function Model (config) {
	config = config || {};
	var idx;
	var key;
	
	this.init = config.init || EmptyFn;
	
	this.fields = {};
	for (idx in config.fields) {
		key = config.fields[idx];
		this.fields[key] = new Field({
			name: key,
			setter: (config.setters || {})[key],
			getter: (config.getters || {})[key],
			defaultvalue: (config.defaultvalues || {})[key]
		});
	}
	
	if (config.data) {
		this.setData(config.data, true);
	}
	
	Observable.call(this, config);
	
	this.init.call(this);
}

Model.prototype = Observable.prototype;

Model.prototype.setValue = function (name, value, silent) {
		var field;
		
		if (this.fields.hasOwnProperty(name)) {
			field = this.fields[name]; 
		} else {
			throw "field does not exist";
		}
		
		if (field.hasOwnProperty('setter')) {
			field.value = field.setter.call(this, value);
		} else {
			this.setRawValue(name, value, silent);
		}
		
		if (!silent) {
			this.fireEvent('update');
		}
		
		return value;
	};

Model.prototype.setRawValue = function (name, value, silent) {
		this.fields[name].value = value;
		if (!silent) {
			this.fireEvent('update');
		}
		return value;
	};
	
Model.prototype.getValue = function (name) {
		var field = this.fields[name]
		if (field.hasOwnProperty('getter')) {	
			return field.getter.call(this, field, value);
		} else {
			return field.value;
		}
		
	};
	
Model.prototype.getRawValue = function (name) {
		return this.fields[name].value;
	};
	
Model.prototype.setData = function (data, silent) {
		//@chainable
		var key;
		for (key in data) {
			this.setValue(key, data[key], silent);
		}
		return this;
	};
	
Model.prototype.setRawData = function (data) {
		//@chainable
		var key;
		for (key in data) {
			this.setRawValue(key, data[name]);
		}
		return this;
	};


function View (config) {
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
	
	Observable.call(this, config);
	
	this.init.call(this);
} 

View.prototype = Observable.prototype;

function Controller (config) {
	config = config || {};
	var key;
	
	this.init = config.init || EmptyFn;
	
	for (key in config) {
		this[key] = config[key];
	}
	
	Observable.call(this, config);
	
	this.init.call(this);
} 

Controller.prototype = Observable.prototype;

function Observable (config) {
	config = config || {};
	var me = this;
	this.events = {};
	
	(config.events || []).forEach(function (elem) {
		me.events[elem] = [];
	});
}

Observable.prototype.addEventListener = function (event, handler) {
		//@chainable
		
		if (!this.events.hasOwnProperty(event)) {
			this.events[event] = [];
		}
		
		this.events[event].push(handler);
		return this;
	};
Observable.prototype.removeEventListener = function (event, handler) {
		//@chainable
		var i,eventHandlers;
		if (this.events.hasOwnProperty(event)) {
			for(eventHandlers = this.events[event], i = eventHandlers.length-1; --i;){
				if (eventHandlers[i] === handler) array.splice(i, 1);
			}
		}
		
		return this;
	};
Observable.prototype.fireEvent = function (event) {
		var me = this;
		var result = true;
	
		this.events[event].forEach(function (handler) {
			if (handler.call(me) === false) {
				result = false;
			}
		});

		return result;
	};