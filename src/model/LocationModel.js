App.model = App.model || {};

App.model.LocationModel = new Class(App.model.Model);

App.model.LocationModel.extend({
	initialize: function (config) {
		config.data = config.data || {};
		config.fields = config.fields || [];
		config.getters = config.getters || {};
		
		/*
		config.fields.push("lat");
		config.fields.push("lng");
		config.fields.push("alt");
		
		config.getters['lat'] = this.latGetter;
		config.getters['lng'] = this.lngGetter;
		config.getters['alt'] = this.altGetter;
		*/
		this.addField({
			name: 'lat',
			getter: this.latGetter,
			defaultValue: 0
		});
		this.addField({
			name: 'lng',
			getter: this.lngGetter,
			defaultValue: 0
		});
		this.addField({
			name: 'alt',
			getter: this.altGetter,
			defaultValue: 0
		});
		
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
		if (!raw) {
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

