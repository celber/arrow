App.controller = App.controller || {};

App.controller.Controller = new Class(App.Base);

App.controller.Controller.extend({
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
App.controller.Controller.implement([App.Observable]);