var CurrentLocation = new (App.LocationModel.extend({
		beforeUpdate: function (coords) {
			// silent update accuracy
			this.setValue('accuracy', coords.accuracy, true);
		}
	}))({
		fields: ['accuracy'],
		getters: {
			accuracy: function (value) {
				return value.toFixed(0);
			}
		}
	});
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
		navigator.geolocation.watchPosition(me.updateCurrentLocationModel,
		function (err) {
			console.log(err)
		},
		{
	        timeout: 2000,
	        enableHighAccuracy: true,
	        maximumAge: Infinity
    	});
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
	signalAccuracyEl: "#signal-accuracy",
	mapEl: "#map",
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
		$(me.headingEl).text(heading.toFixed());
	},
	updateSignalAccuracy: function (accuracy) {
		var me = this;
		
		$(me.signalAccuracyEl).text(accuracy);	
	},
	renderMap: function (lat, lng, zoom) {
		var me = this;
		
		var mapOptions = {
          center: { lat: lat, lng: lng},
          zoom: zoom,
           disableDefaultUI: true,
           scrollwheel: false,
		    navigationControl: false,
		    mapTypeControl: false,
		    scaleControl: false,
		    draggable: false,
          styles: [
    {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 13
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#144b53"
            },
            {
                "lightness": 14
            },
            {
                "weight": 1.4
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#08304b"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#0b434f"
            },
            {
                "lightness": 25
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#0b3d51"
            },
            {
                "lightness": 16
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "color": "#146474"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#021019"
            }
        ]
    }
]
        };
        me.map = new google.maps.Map(document.querySelector(me.mapEl),
            mapOptions);
            
		me.mapCurrentPositionPolygon = new google.maps.Circle({
	      strokeColor: '#47DD8E',
	      strokeOpacity: 0.8,
	      strokeWeight: 2,
	      fillColor: '#3FC57E',
	      fillOpacity: 0.35,
	      map: me.map,
	      center: new google.maps.LatLng(lat, lng),
	      radius: 10
		});
	},
	updateMap: function (lat, lng, zoom, accuracy) {
		var me = this;
		me.map.setCenter(new google.maps.LatLng(lat, lng));
		me.map.setZoom(zoom);
		me.mapCurrentPositionPolygon.setCenter(new google.maps.LatLng(lat, lng));
		me.mapCurrentPositionPolygon.setRadius(accuracy);
	},
	init: function() {
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
			me.updateMap(this.getRawValue('lat'), this.getRawValue('lng'),  14, accuracy);
		});
		Compass.watch((function (scope) {
			return function(heading) {
				scope.headDirectionArrow.call(scope, heading);
			}
		}(me)));
	}
});