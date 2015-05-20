var MapView = new Class(App.view.Map);
MapView.extend({
	mapEl: '#map'
});

MapView = new MapView({
	model: App.model.CurrentLocation,
	destination: App.model.DestinationLocation,
	mapCurrentPositionPolygonStyle: {
			strokeColor: '#47DD8E',
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: '#3FC57E',
			fillOpacity: 0.35,
			radius: 10
		},
	mapDestinationPositionPolygonStyle: {
			strokeColor: '#f02020',
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: '#f01010',
			fillOpacity: 0.35,
			radius: 10
		},
	mapStyle: [{
				"featureType": "all",
				"elementType": "labels.text.fill",
				"stylers": [{
					"color": "#ffffff"
				}]
			}, {
				"featureType": "all",
				"elementType": "labels.text.stroke",
				"stylers": [{
					"color": "#000000"
				}, {
					"lightness": 13
				}]
			}, {
				"featureType": "administrative",
				"elementType": "geometry.fill",
				"stylers": [{
					"color": "#000000"
				}]
			}, {
				"featureType": "administrative",
				"elementType": "geometry.stroke",
				"stylers": [{
					"color": "#144b53"
				}, {
					"lightness": 14
				}, {
					"weight": 1.4
				}]
			}, {
				"featureType": "landscape",
				"elementType": "geometry",
				"stylers": [{
					"color": "#08304b"
				}]
			}, {
				"featureType": "poi",
				"elementType": "all",
				"stylers": [{
					"visibility": "off"
				}]
			}, {
				"featureType": "road.highway",
				"elementType": "geometry.fill",
				"stylers": [{
					"color": "#000000"
				}]
			}, {
				"featureType": "road.highway",
				"elementType": "geometry.stroke",
				"stylers": [{
					"color": "#0b434f"
				}, {
					"lightness": 25
				}]
			}, {
				"featureType": "road.arterial",
				"elementType": "geometry.fill",
				"stylers": [{
					"color": "#000000"
				}]
			}, {
				"featureType": "road.arterial",
				"elementType": "geometry.stroke",
				"stylers": [{
					"color": "#0b3d51"
				}, {
					"lightness": 16
				}]
			}, {
				"featureType": "road.local",
				"elementType": "geometry",
				"stylers": [{
					"color": "#000000"
				}]
			}, {
				"featureType": "transit",
				"elementType": "all",
				"stylers": [{
					"color": "#146474"
				}]
			}, {
				"featureType": "water",
				"elementType": "all",
				"stylers": [{
					"color": "#021019"
				}]
			}]
});

var CompassView = new Class(App.view.Compass);
CompassView.extend({
	directionArrowEl: '#direction .direction-arrow',
	headingEl: '#heading',
	compassShieldEl: "#compass .shield"
});
CompassView = new CompassView({
	destinationLocation: App.model.DestinationLocation
});

var ProView = new Class(App.view.View)
ProView.extend({
	currentLatEl: "#position .latitude",
	currentLngEl: "#position .longitude",
	currentAltEl: "#position .altitude",
	destinationLatEl: "#target .latitude",
	destinationLngEl: "#target .longitude",
	destinationAltEl: "#target .altitude",
	distanceEl: "#distance",
	signalAccuracyEl: "#signal-accuracy",
	mapView: null,
	compassView: null,
	destinationLocationModel: null,
	updateCurrentPosition: function(lat, lng, alt) {
		var me = this;
		$(me.currentLatEl).text(lat);
		$(me.currentLngEl).text(lng);
		$(me.currentAltEl).text(alt);
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
	renderDestinationPosition: function(locationModel) {
		var me = this;
		var destinationPoint = locationModel;
		$(me.destinationLatEl).text(destinationPoint.getValue('lat'));
		$(me.destinationLngEl).text(destinationPoint.getValue('lng'));
		$(me.destinationAltEl).text(destinationPoint.getValue('alt'));
	},
	renderCurrentLocation: function (locationModel) {
		var me = this;
		var coords = locationModel.getCoords();
		var localeCoors = coords.toLocaleString();
		var localLat = localeCoors.split(", ")[0];
		var localLng = localeCoors.split(", ")[1];
		var localAlt = locationModel.getValue("alt");
		var accuracy = Number(locationModel.getValue("accuracy"));
		me.updateCurrentPosition(localLat, localLng, localAlt);
		me.updateDestinationDistance(coords);
		me.updateSignalAccuracy(accuracy);
	},
	updateSignalAccuracy: function(accuracy) {
		var me = this;
		$(me.signalAccuracyEl).text(accuracy);
	},
	initialize: function(config) {
		var me = this;
		config = config || {};
		
		me.mapView = config.mapView || me.mapView;
		me.compassView = config.compassView || me.compassView;
		me.destinationLocationModel = config.destinationLocationModel || me.destinationLocationModel;		
		me.currentLocationModel = config.currentLocationModel || me.currentLocationModel;
		
		me.renderDestinationPosition(config.destinationLocationModel);
		me.currentLocationModel.addEventListener("update", me.renderCurrentLocation ,me);
		
		me.renderCurrentLocation(me.currentLocationModel);
		
		ProView._parent.initialize.call(this, config);
	}
});

ProView = new ProView({
	mapView: MapView,
	compassView: CompassView,
	destinationLocationModel: App.model.DestinationLocation,
	currentLocationModel: App.model.CurrentLocation
});