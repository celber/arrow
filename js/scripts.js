var POSITION_UPDATE_INTERVAL = 10000;

var CurrentLocation = new App.LocationModel({});
var DestinationLocation = new App.LocationModel({
	fields: ['bearing'],
	data: {
		lat: 54.403041,
		lng: 18.590118,
		alt: 90
	}
});

var MainController = new App.Controller({
	init: function() {
		var me = this;
		var queryParams = me.parseQueryString();
		Compass.needGPS(function() {
			$('.go-outside-message').show(); // Step 1: we need GPS signal
		}).needMove(function() {
			$('.go-outside-message').hide()
			$('.move-and-hold-ahead-message').show(); // Step 2: user must go forward
		}).init(function() {
			$('.move-and-hold-ahead-message').hide(); // GPS hack is enabled
		});
		navigator.geolocation.getCurrentPosition(me.updateCurrentLocationModel);
		setInterval(function() {
			navigator.geolocation.getCurrentPosition(me.updateCurrentLocationModel);
		}, POSITION_UPDATE_INTERVAL);
	},
	updateCurrentLocationModel: function(location) {
		CurrentLocation.setCoords(location.coords);
		DestinationLocation.setValue('bearing',CurrentLocation.getCoords().finalBearingTo(DestinationLocation.getCoords()))
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
		mainView: function () {return App.MainView}
	}
});

var MainView = new App.View({
	currentLatEl: "#position .latitude",
	currentLngEl: "#position .longitude",
	currentAltEl: "#position .altitude",
	destinationLatEl: "#target .latitude",
	destinationLngEl: "#target .longitude",
	destinationAltEl: "#target .altitude",
	distanceEl: "#distance",
	directionArrowEl: '#direction .direction-arrow',
	headingEl: '#heading',
	compassShieldEl: "#compass .shield",
	updateCurrentPosition: function(lat, lng, alt) {
		var me = this;
		$(me.currentLatEl).text(lat);
		$(me.currentLngEl).text(lng);
		$(me.currentAltEl).text(alt);
		
		var bearing = CurrentLocation.getCoords().finalBearingTo(DestinationLocation.getCoords());
		
		$('#bearing').text(bearing);
	},
	updateDestinationDistance: function(coords) {
		var me = this;
		
		var raw = coords.distanceTo(DestinationLocation.getCoords()).toFixed(3);
		
		var wholes = raw.split(".")[0];
		var decimals = raw.split(".")[1];
			
	
		$(me.distanceEl).html("<div class='distance'><div class='wholes'>"+wholes+"</div><div class='decimals'>."+decimals+"</div><div class='unit'>m</div></div>");
	},
	setDestinationPosition: function () {
		var me = this;
		var destinationPoint = DestinationLocation;
		
		$(me.destinationLatEl).text(destinationPoint.getValue('lat'));
		$(me.destinationLngEl).text(destinationPoint.getValue('lng'));
		$(me.destinationAltEl).text(destinationPoint.getValue('alt'));	
	},
	headDirectionArrow: function (heading) {
		var me = this;
		var bearing = DestinationLocation.getValue('bearing');
		$(me.compassShieldEl).css('transform', 'rotate(' + (-heading) + 'deg)');
		$(me.directionArrowEl).css('transform', 'rotate(' + (-heading+bearing) + 'deg)');
		$(me.headingEl).text(heading.toFixed()+"°");
	},
	init: function() {
		var me = this;
		me.setDestinationPosition();

		CurrentLocation.addEventListener("update", function() {
			var coords = this.getCoords();
			var localeCoors = coords.toLocaleString();
			var localLat = localeCoors.split(", ")[0];
			var localLng = localeCoors.split(", ")[1];
			var localAlt = this.getValue("alt");
			me.updateCurrentPosition(localLat, localLng, localAlt);
			me.updateDestinationDistance(coords);
		});
		Compass.watch((function (scope) {
			return function(heading) {
				scope.headDirectionArrow.call(scope, heading);
			}
		}(me)));
	}
});