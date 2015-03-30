function App() {};

function EmptyFn () {};

App.Base = new Class({
	initialize: function (config) {
		config = config || {};
		var key;
		
		this.afterInit = config.afterInit || EmptyFn;
		
		for (key in config) {
			this[key] = config[key];
		}	
		
		this.afterInit.call(this);
	}
});
App.Observable = {
	addEvent: function (name) {
		if (!this.events) {
			this.events = {};
		}
		this.events[name] = this.events[name] || [];
	},
	addEventListener: function (event, handler, scope_) {
		//@chainable

		var scope = scope_ || this;

		this.events[event].push({fn: handler, scope: scope});
		return this;
	},
	removeEventListener: function (event, handler) {
		//@chainable
		var i,eventHandlers;
		if (this.events.hasOwnProperty(event)) {
			for(eventHandlers = this.events[event], i = eventHandlers.length-1; --i;){
				if (eventHandlers[i].fn === handler) array.splice(i, 1);
			}
		}
		
		return this;
	},
	fireEvent: function (event) {
		var me = this;
		var result = true;
	
		this.events[event].forEach(function (handler) {
			if (handler.hasOwnProperty('fn')) {
				if (handler.fn.call(handler.scope, me) === false) {
					result = false;
				}
			} else {
				if (handler.call(me, me) === false) {
					result = false;
				}
			}			
		});

		return result;
	}
};


App.model = App.model || {};

App.model.Field = new Class({
	initialize: function (config) {
		config = config || {};
		
		this.name = config.name;
		if (config.setter) {
			this.setter = config.setter;
		}
		if (config.getter) {
			this.getter = config.getter;
		}
		
		if (config.value) {
			this.setValue(config.value);
		} else if (config.defaultValue) {
			this.value = config.defaultValue;
		} else {
			this.setValue(null);
		}
	},
	getValue: function () {
		if (this.hasOwnProperty('getter')) {	
			return this.getter.call(this, this.value);
		} else {
			return this.value;
		}
	},
	getRawValue: function () {
		return this.value;
	},
	setValue: function (value) {
		if (this.hasOwnProperty('setter')) {	
			return this.setter.call(this, value);
		} else {
			return this.setRawValue(value);
		}
	},
	setRawValue: function (value) {
		return this.value = value;
	}
});

App.model = App.model || {};

App.model.Model = new Class(App.Base);
App.model.Model.implement([App.Observable]);

App.model.Model.extend({
	initialize: function (config) {
		config = config || {};
		var idx;
		var key;
		
		this.addEvent("update");
		
		for (idx in config.fields) {
			key = config.fields[idx];
			this.addField({
				name: key,
				setter: (config.setters || {})[key],
				getter: (config.getters || {})[key],
				defaultValue: (config.defaultvalues || {})[key]
			});
		}
		
		if (config.data) {
			this.setData(config.data, true);
		}
	},
	addField: function (field) {
		if (!this.fields) {
			this.fields = {};
		}
		this.fields[field.name] = new App.model.Field(field);
	},
	setValue: function (name, value, silent) {
		var field;
		
		if (this.fields.hasOwnProperty(name)) {
			field = this.fields[name]; 
		} else {
			throw "field does not exist";
		}
		
		value = field.setValue(value);
		
		if (!silent) {
			this.fireEvent('update');
		}
		
		return value;
	},
	setRawVaue: function (name, value, silent) {
		if (this.fields.hasOwnProperty(name)) {
			field = this.fields[name]; 
		} else {
			throw "field does not exist";
		}
		
		this.fields[name].setRawValue(value);
		if (!silent) {
			this.fireEvent('update');
		}
		return value;
	},
	getValue: function (name) {
		var field = this.fields[name];
		return field.getValue();
	},
	getRawValue: function (name) {
		return this.fields[name].getRawValue();
	},
	setData: function (data, silent) {
		//@chainable
		var key;
		for (key in data) {
			this.setValue(key, data[key], silent);
		}
		return this;
	},
	setRawValue: function (data) {
		//@chainable
		var key;
		for (key in data) {
			this.setRawValue(key, data[name]);
		}
		return this;
	},
	beforeUpdate: function () {
		//@template
		//do here additional changes before 'update' is fired
	}
});

App.model = App.model || {};

App.model.LocationModel = new Class(App.model.Model);

App.model.LocationModel.extend({
	initialize: function (config) {
		config.data = config.data || {};
		config.fields = config.fields || [];
		config.getters = config.getters || {};
		
		config.fields.push("lat");
		config.fields.push("lng");
		config.fields.push("alt");
		
		config.getters['lat'] = this.latGetter;
		config.getters['lng'] = this.lngGetter;
		config.getters['alt'] = this.altGetter;
		
		App.model.LocationModel._parent.initialize.call(this, config);

		this.LatLng = new LatLon(this.getRawValue("lat"), this.getRawValue("lng"));
	},
	setCoords: function (coords) {
		var data = this.setData({
			lat: coords.latitude,
			lng: coords.longitude,
			alt: coords.altitude || 0
		}, true);
		
		this.LatLng = new LatLon(this.getRawValue('lat'), this.getRawValue('lng'));
		
		this.beforeUpdate.apply(this, arguments);
		this.fireEvent("update");
		
		return data;
	},
	getCoords: function () {
		return this.LatLng;
	},
	latGetter: function () {
		var raw = this.getRawValue('lat');
		return Dms.toLat(raw);
	},
	lngGetter: function () {
		var raw = this.getRawValue('lng');
		return Dms.toLon(raw);	
	},
	altGetter: function () {
		var raw = this.getRawValue('alt');
		var wholes;
		var decimals;
		if (raw == 0) {
			return "not available"
		} else {/*

			wholes = raw.toFixed();
			decimals = raw.toFixed(2) - wholes;
			
			return "<div class='distance'><div class='wholes'>"+wholes+"</div><div class='decimals'>"+decimals+"</div><div class='unit'>m</div></div>"
*/
			
			return raw.toFixed(1)+"m"
		}
	}
});


App.controller = App.controller || {};

App.controller.Controller = new Class(App.Base);

App.controller.Controller.extend({});
App.controller.Controller.implement([App.Observable]);
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
	headDirectionArrow: function(heading) {
		var me = this;
		var bearing = DestinationLocation.getValue('bearing');
		$(me.compassShieldEl).css('transform', 'rotate(' + (-heading) + 'deg)');
		$(me.directionArrowEl).css('transform', 'rotate(' + (-heading + bearing) + 'deg)');
		$(me.headingEl).text(heading.toFixed());
	},
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
		me.model = config.model || me.model;
		
		
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
		
	},
	updateMap: function(lat, lng, radius_, zoom_) {
		var me = this;
		var location = new google.maps.LatLng(lat, lng);
		me.map.setCenter(location);
		me.map.setZoom(zoom_ || 10);
		me.mapCurrentPositionPolygon.setCenter(location);
		me.mapCurrentPositionPolygon.setRadius(radius_ || 100);
	},
	setLocation: function (lat, lng, zoom_, accuracy_) {
		//@chainable
		var me = this;
		me.updateMap(lat, lng, zoom_ || me.zoom, accuracy_ || 1000);
		
		return me;
	} 
});
App.view = App.view || {};
App.view.Compass = new Class(App.View);

App.view.Compass.extend({
	headDirectionArrow: function(heading) {
		var me = this;
		var bearing = me.destinationLocation.getValue('bearing');
		$(me.compassShieldEl).css('transform', 'rotate(' + (-heading) + 'deg)');
		$(me.directionArrowEl).css('transform', 'rotate(' + (-heading + bearing) + 'deg)');
		$(me.headingEl).text(heading.toFixed());
	},
	initialize: function (config) {
		var me = this;
		
		config = config || {};
		
		me.destinationLocation = config.destinationLocation || config.destinationLocation;
		
		//TODO: handle errors
		Compass.needGPS(function() {
			$('.go-outside-message').show(); // Step 1: we need GPS signal
		}).needMove(function() {
			$('.go-outside-message').hide()
			$('.move-and-hold-ahead-message').show(); // Step 2: user must go forward
		}).init(function() {
			$('.move-and-hold-ahead-message').hide(); // GPS hack is enabled
		});
		
		Compass.watch((function(scope) {
			return function(heading) {
				scope.headDirectionArrow.call(scope, heading);
			}
		}(me)));
	}
});
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