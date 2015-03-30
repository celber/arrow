App.controller = App.controller || {};

App.controller.GPSController = new Class(App.controller.Controller);

App.controller.GPSController.extend({
	currentLocationModel: null,
	destinationLocationModel: null,
	initialize: function(config) {
		var me = this;
		config = config || {};
		
		me.currentLocationModel = config.currentLocationModel || me.currentLocationModel;
		me.destinationLocationModel = config.destinationLocationModel || me.destinationLocationModel;
		
		var geolocationHandler = (function (scope) {
			return function () {
				me.updateCurrentLocationModel.apply(scope, arguments);
			}
		})(me);
		
		navigator.geolocation.watchPosition(geolocationHandler, function(err) {
			console.log(err)
		}, {
			timeout: 500,
			enableHighAccuracy: false,
			maximumAge: Infinity
		});
		
		App.controller.GPSController._parent.initialize.call(this, config);
		
	},
	updateCurrentLocationModel: function(location) {
		var me = this;
		me.currentLocationModel.setCoords(location.coords);
		me.destinationLocationModel.setValue('bearing', me.currentLocationModel.getCoords().finalBearingTo(me.destinationLocationModel.getCoords()))
	},
	setDestinationLocationModel: function(lat, lng, alt) {
		me.destinationLocationModel.setCoords({
			latitude: lat,
			longitude: lng,
			altitude: alt
		});
	}
});
