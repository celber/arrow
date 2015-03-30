App.view = App.view || {};
App.view.Map = new Class(App.view.View);

App.view.Map.extend({
	mapEl: null,
	mapCurrentPositionPolygon: {
		strokeOpacity: 0.8,
		strokeWeight: 2,
		fillOpacity: 0.35,
		radius: 10
	},
	mapStyle: null,
	mapOptions: {
		disableDefaultUI: true,
		scrollwheel: false,
		navigationControl: false,
		mapTypeControl: false,
		scaleControl: false,
		draggable: false,
	},
	lat: 0,
	lng: 0,
	zoom: 10,
	model: null,
	headDirectionArrow: function(heading) {
		var me = this;
		var bearing = DestinationLocation.getValue('bearing');
		$(me.compassShieldEl).css('transform', 'rotate(' + (-heading) + 'deg)');
		$(me.directionArrowEl).css('transform', 'rotate(' + (-heading + bearing) + 'deg)');
		$(me.headingEl).text(heading.toFixed());
	},
	initialize: function (config) {
		var me = this;
		
		me.mapEl = config.mapEl || me.mapEl;
		me.mapStyle = config.mapStyle || me.mapStyle;
		me.mapOptions = config.mapOptions || me.mapOptions;
		me.lat = config.lat || me.lat;
		me.lng = config.lng || me.lng;
		me.zoom = config.zoom || me.zoom;
		me.mapCurrentPositionPolygon = config.mapCurrentPositionPolygon || me.mapCurrentPositionPolygon;
		me.model = config.model || me.model;
		
		
		me.renderMap(me.lat, me.lng, me.zoom);
		
		me.model = me.model || new App.model.LocationModel({});
		me.model.addEventListener('update', me.onLocationUpdate, me);
		
		App.model.LocationModel._parent.initialize.call(this, config);
	},
	onLocationUpdate: function (model) {
		var coords = model.getCoors();
		return me.updateMap(coords.lat, coords.lat, me.zoom, me.zoom);
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
		
		me.mapCurrentPositionPolygon = new google.maps.Circle(me.mapCurrentPositionPolygon);
		
		me.mapCurrentPositionPolygon.setCenter(center);
		me.mapCurrentPositionPolygon.setMap(me.map);
		
	},
	updateMap: function(lat, lng, radius_, zoom_) {
		var me = this;
		var location = new google.maps.LatLng(lat, lng);
		me.map.setCenter(location);
		me.map.setZoom(zoom_ || 10);
		me.mapCurrentPositionPolygon.setCenter(location);
		me.mapCurrentPositionPolygon.setRadius(radius || 100);
	},
	setLocation: function (lat, lng, zoom_, accuracy_) {
		//@chainable
		var me = this;
		me.updateMap(lat, lng, zoom_ || me.zoom, accuracy_ || 1000);
		
		return me;
	} 
});