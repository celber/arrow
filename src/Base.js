function App() {};

function EmptyFn () {};

App.Base = new Class({
	initialize: function (config) {
		config = config || {};
		var key;
		
		this.afterInit = config.afterInit || EmptyFn;
		
		for (key in config) {
			this[key] = config[key];
		}	
		
		this.afterInit.call(this);
	}
});