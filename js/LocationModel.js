function LocationModel(config) {
	config = config || {};
	var key;
	var defaults = {
		fields: ["lat", "lng", "alt"],
		getter: {
			"lat": this.latGetter,
			"lng": this.lngGetter
		},
		events: ['update'],
		data: {
			"lat": 0,
			"lng": 0
		}
	};
	
	for (key in config) {
		defaults[key] = config[key];
	}
	
	this.LatLng = new LatLon(defaults.data.lat, defaults.data.lng);
	
	Model.call(this, defaults);
}

LocationModel.prototype = Model.prototype;

LocationModel.prototype.setCoords = function (coords) {
	var data = this.setData({
		lat: coords.latitude,
		lng: coords.longitude,
		alt: coords.altitude || 0
	}, true);
	
	this.LatLng = new LatLon(this.getRawValue('lat'), this.getRawValue('lng'));
	
	this.fireEvent("update");
	
	return data;
};

LocationModel.prototype.getCoords = function () {
	return this.LatLng;
};

LocationModel.prototype.latGetter = function () {
	var raw = this.getRawValue('lat');
	return DMS.toLat(raw);
};

LocationModel.prototype.lngGetter = function () {
	var raw = this.getRawValue('lng');
	return DMS.toLng(raw);	
};