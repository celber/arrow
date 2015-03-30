App.model.CurrentLocation = new App.model.LocationModel({
		fields: ['accuracy'],
		getters: {
			accuracy: function(value) {
				return value.toFixed(0);
			}
		}
	});
	App.model.CurrentLocation.beforeUpdate = function(coords) {
		// silent update accuracy
		this.setValue('accuracy', coords.accuracy, true);
	};
	
App.model.DestinationLocation = new App.model.LocationModel({
	fields: ['bearing']
});

App.controller.MainController = new Class(App.controller.Controller);

App.controller.MainController.extend({
	destinationLocationModel: null,
	initialize: function(config) {
		var me = this;
		config = config || {};
		var queryParams = me.parseQueryString();
		
		me.destinationLocationModel = config.destinationLocationModel || me.destinationLocationModel;
		
		if ("lat" in queryParams && "lng" in queryParams) {
			me.setDestinationLocationModel(Number(queryParams.lat), Number(queryParams.lng), Number(queryParams.alt || 0));	
		} else {
			me.setDestinationLocationModel(54.403041, 18.590118, 5);
		}
		
		App.controller.MainController._parent.initialize.call(this, config);
		
	},
	setDestinationLocationModel: function(lat, lng, alt) {
		var me = this;
		me.destinationLocationModel.setCoords({
			latitude: lat,
			longitude: lng,
			altitude: alt
		});
	},
	parseQueryString: function() {
		var str = window.location.search;
		var objURL = {};
		str.replace(
		new RegExp("([^?=&]+)(=([^&]*))?", "g"), function($0, $1, $2, $3) {
			objURL[$1] = $3;
		});
		return objURL;
	}
});

App.controller.MainController = new App.controller.MainController({
	destinationLocationModel: App.model.DestinationLocation
});

App.controller.GPSController = new App.controller.GPSController({
	destinationLocationModel: App.model.DestinationLocation,
	currentLocationModel: App.model.CurrentLocation
});