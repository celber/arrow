var CompassView = new Class(App.view.Compass);
CompassView.extend({
	directionArrowEl: '#direction .direction-arrow',
	headingEl: '#heading',
	compassShieldEl: "#compass .shield"
});
CompassView = new CompassView({
	destinationLocation: App.model.DestinationLocation
});

var SimpleView = new Class(App.view.View)
SimpleView.extend({
	distanceEl: "#distance",
	signalAccuracyEl: "#signal-accuracy",
	compassView: null,
	destinationLocationModel: null,
	renderCurrentLocation: function (locationModel) {
		var me = this;
		var coords = locationModel.getCoords();
		var localeCoors = coords.toLocaleString();
		var localLat = localeCoors.split(", ")[0];
		var localLng = localeCoors.split(", ")[1];
		var localAlt = locationModel.getValue("alt");
		var accuracy = Number(locationModel.getValue("accuracy"));
		me.updateDestinationDistance(coords);
		me.updateSignalAccuracy(accuracy);
	},
	updateDestinationDistance: function(coords) {
		var me = this;
		var raw = coords.distanceTo(me.destinationLocationModel.getCoords()).toFixed(3);
		var wholes = raw.split(".")[0];
		var decimals = raw.split(".")[1];
		
		// TODO: better signal recognition
		if (wholes > 100000) { 
			$(me.distanceEl).html("<div class='distance'>NO SIGNAL</div>");
		} else {
			$(me.distanceEl)
			.html("<div class='distance'><div class='wholes'>" + wholes + "</div><div class='decimals'>." + decimals + "</div><div class='unit'>m</div></div>");	
		}
	},
	updateSignalAccuracy: function(accuracy) {
		var me = this;
		$(me.signalAccuracyEl).text(accuracy);
	},
	initialize: function(config) {
		var me = this;
		config = config || {};
		
		me.compassView = config.compassView || me.compassView;
		me.destinationLocationModel = config.destinationLocationModel || me.destinationLocationModel;		
		me.currentLocationModel = config.currentLocationModel || me.currentLocationModel;
		
		me.currentLocationModel.addEventListener("update", me.renderCurrentLocation ,me);
		
		SimpleView._parent.initialize.call(this, config);
	}
});

SimpleView = new SimpleView({
	compassView: CompassView,
	destinationLocationModel: App.model.DestinationLocation,
	currentLocationModel: App.model.CurrentLocation
});