App.view = App.view || {};
App.view.Map = new Class(App.view.View);

App.view.Map.extend({
	mapEl: null,
	mapCurrentPositionPolygon: null,
	mapCurrentPositionPolygonStyle: null,
	mapStyle: null,
	mapOptions: null,
	lat: 0,
	lng: 0,
	zoom: 14,
	model: null,
	initialize: function (config) {
		var me = this;
		config = config || {};
		
		me.mapEl = config.mapEl || me.mapEl;
		me.mapStyle = config.mapStyle || me.mapStyle;
		me.mapOptions = config.mapOptions || {
			disableDefaultUI: true,
			scrollwheel: false,
			navigationControl: false,
			mapTypeControl: false,
			scaleControl: false,
			draggable: false,
		};
		me.lat = config.lat || me.lat;
		me.lng = config.lng || me.lng;
		me.zoom = config.zoom || me.zoom;
		me.mapCurrentPositionPolygonStyle = config.mapCurrentPositionPolygonStyle || {
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillOpacity: 0.35,
			radius: 10
		};
		
		me.mapDestinationPositionPolygonStyle = config.mapDestinationPositionPolygonStyle || {
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillOpacity: 0.35,
			radius: 10
		};
		
		me.model = config.model || me.model;
		me.destination = config.destination || me.destination;
		
		me.renderMap(me.lat, me.lng, me.zoom);
		
		me.model = me.model || new App.model.LocationModel({});
		me.model.addEventListener('update', me.onLocationUpdate, me);
		me.onLocationUpdate(me.model);
		
		App.model.LocationModel._parent.initialize.call(this, config);
	},
	onLocationUpdate: function (model) {
		var me = this;
		return me.updateMap(model.getRawValue('lat'), model.getRawValue('lng'), Number(model.getValue('accuracy')), me.zoom);
	},
	renderMap: function(lat, lng, zoom) {
		var me = this;
		var mapOptions = me.mapOptions || {};
		var center = new google.maps.LatLng(lat, lng);
		
		
		mapOptions.styles = mapOptions.styles || me.mapStyle || [];
		mapOptions.zoom = zoom || mapOptions.zoom || me.zoom;
		
		me.map = new google.maps.Map(document.querySelector(me.mapEl), mapOptions);
		
		
		me.map.setCenter(center);
		me.map.setZoom(zoom);
		
		me.mapCurrentPositionPolygon = new google.maps.Circle(me.mapCurrentPositionPolygonStyle);
		
		me.mapCurrentPositionPolygon.setCenter(center);
		me.mapCurrentPositionPolygon.setMap(me.map);
		
		
		me.mapDestinationPositionPolygon = new google.maps.Circle(me.mapDestinationPositionPolygonStyle);
		me.mapDestinationPositionPolygon.setMap(me.map);
	},
	updateMap: function(lat, lng, radius_, zoom_) {
		var me = this;
		var location = new google.maps.LatLng(lat, lng);
		me.map.setCenter(location);
		me.map.setZoom(zoom_ || 10);
		me.mapCurrentPositionPolygon.setCenter(location);
		me.mapCurrentPositionPolygon.setRadius(radius_ || 100);
		
		me.updateDestinationPolygon();
	},
	updateDestinationPolygon: function () {
		var me = this;
		var location;
		
		if (me.destination) {
			location = new google.maps.LatLng(me.destination.getRawValue('lat'), me.destination.getRawValue('lng'));
			
			me.mapDestinationPositionPolygon.setCenter(location);	
		}
	},
	setLocation: function (lat, lng, zoom_, accuracy_) {
		//@chainable
		var me = this;
		me.updateMap(lat, lng, zoom_ || me.zoom, accuracy_ || 1000);
		
		return me;
	} 
});