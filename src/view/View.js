App.view = App.view || {};

App.view.View = new Class(App.Base);

App.view.View.extend({
	initialize: function (config) {
		config = config || {};
		if (typeof config.el == "string") {
			this.el = document.querySelector(config.el);
		} else {
			this.el = config.el;
		}
		
		App.view.View._parent.initialize.call(this, config);
	}
});
App.view.View.implement([App.Observable]);