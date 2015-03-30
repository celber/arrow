App.Observable = {
	addEvent: function (name) {
		if (!this.events) {
			this.events = {};
		}
		this.events[name] = this.events[name] || [];
	},
	addEventListener: function (event, handler, scope_) {
		//@chainable

		var scope = scope_ || this;

		this.events[event].push({fn: handler, scope: scope});
		return this;
	},
	removeEventListener: function (event, handler) {
		//@chainable
		var i,eventHandlers;
		if (this.events.hasOwnProperty(event)) {
			for(eventHandlers = this.events[event], i = eventHandlers.length-1; --i;){
				if (eventHandlers[i].fn === handler) array.splice(i, 1);
			}
		}
		
		return this;
	},
	fireEvent: function (event) {
		var me = this;
		var result = true;
	
		this.events[event].forEach(function (handler) {
			if (handler.hasOwnProperty('fn')) {
				if (handler.fn.call(handler.scope, me) === false) {
					result = false;
				}
			} else {
				if (handler.call(me, me) === false) {
					result = false;
				}
			}			
		});

		return result;
	}
};

