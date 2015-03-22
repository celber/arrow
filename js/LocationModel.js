App.LocationModel = new Class(App.Model);

App.LocationModel.extend({
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
		
		App.LocationModel._parent.initialize.call(this, config);

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
	beforeUpdate: function () {
		//@template
		//do here additional changes before 'update' is fired
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

