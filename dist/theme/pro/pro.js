var CurrentLocation = new App.model.LocationModel({
		fields: ['accuracy'],
		getters: {
			accuracy: function(value) {
				return value.toFixed(0);
			}
		}
	});
	CurrentLocation.beforeUpdate = function(coords) {
		// silent update accuracy
		this.setValue('accuracy', coords.accuracy, true);
	};
	
var DestinationLocation = new App.model.LocationModel({
	fields: ['bearing']
});

var MainController = new App.controller.Controller({
	initialize: function() {
		var me = this;
		var queryParams = me.parseQueryString();
		//TODO: handle errors
		Compass.needGPS(function() {
			$('.go-outside-message').show(); // Step 1: we need GPS signal
		}).needMove(function() {
			$('.go-outside-message').hide()
			$('.move-and-hold-ahead-message').show(); // Step 2: user must go forward
		}).init(function() {
			$('.move-and-hold-ahead-message').hide(); // GPS hack is enabled
		});
		navigator.geolocation.watchPosition(me.updateCurrentLocationModel, function(err) {
			console.log(err)
		}, {
			timeout: 2000,
			enableHighAccuracy: true,
			maximumAge: Infinity
		});
		
		if ("lat" in queryParams && "lng" in queryParams) {
			me.setDestinationLocationModel(Number(queryParams.lat), Number(queryParams.lng), Number(queryParams.alt || 0));	
		} else {
			me.setDestinationLocationModel(54.403041, 18.590118, 5);
		}
		
		MainController._parent.initialize.call(this, config);
		
	},
	updateCurrentLocationModel: function(location) {
		CurrentLocation.setCoords(location.coords);
		DestinationLocation.setValue('bearing', CurrentLocation.getCoords().finalBearingTo(DestinationLocation.getCoords()))
	},
	setDestinationLocationModel: function(lat, lng, alt) {
		DestinationLocation.setCoords({
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
	},
	views: {
		proView: function() {
			return App.ProView
		}
	}
});

var MapView = new App.view.Map({
	mapEl: '#map'
});


var ProView = new App.view.View({
	currentLatEl: "#position .latitude",
	currentLngEl: "#position .longitude",
	currentAltEl: "#position .altitude",
	destinationLatEl: "#target .latitude",
	destinationLngEl: "#target .longitude",
	destinationAltEl: "#target .altitude",
	distanceEl: "#distance",
	signalAccuracyEl: "#signal-accuracy",
	mapView: MapView,
	updateCurrentPosition: function(lat, lng, alt) {
		var me = this;
		$(me.currentLatEl).text(lat);
		$(me.currentLngEl).text(lng);
		$(me.currentAltEl).text(alt);
	},
	updateDestinationDistance: function(coords) {
		var me = this;
		var raw = coords.distanceTo(DestinationLocation.getCoords()).toFixed(3);
		var wholes = raw.split(".")[0];
		var decimals = raw.split(".")[1];
		$(me.distanceEl).html("<div class='distance'><div class='wholes'>" + wholes + "</div><div class='decimals'>." + decimals + "</div><div class='unit'>m</div></div>");
	},
	setDestinationPosition: function() {
		var me = this;
		var destinationPoint = DestinationLocation;
		$(me.destinationLatEl).text(destinationPoint.getValue('lat'));
		$(me.destinationLngEl).text(destinationPoint.getValue('lng'));
		$(me.destinationAltEl).text(destinationPoint.getValue('alt'));
	},
	updateSignalAccuracy: function(accuracy) {
		var me = this;
		$(me.signalAccuracyEl).text(accuracy);
	},
	initialize: function() {
		var me = this;
		me.setDestinationPosition();
		me.renderMap(52.187405, 18.896484, 8);
		CurrentLocation.addEventListener("update", function() {
			var coords = this.getCoords();
			var localeCoors = coords.toLocaleString();
			var localLat = localeCoors.split(", ")[0];
			var localLng = localeCoors.split(", ")[1];
			var localAlt = this.getValue("alt");
			var accuracy = Number(this.getValue("accuracy"));
			me.updateCurrentPosition(localLat, localLng, localAlt);
			me.updateDestinationDistance(coords);
			me.updateSignalAccuracy(accuracy);
			me.updateMap(this.getRawValue('lat'), this.getRawValue('lng'), 14, accuracy);
		});
		
		ProView._parent.initialize.call(this, config);
	}
});