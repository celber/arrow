var CurrentLocation = new LocationModel();

var MainController = new Controller({
	init: function () {
		var me = this;
		Compass.needGPS(function () {
		  $('.go-outside-message').show();          // Step 1: we need GPS signal
		}).needMove(function () {
		  $('.go-outside-message').hide()
		  $('.move-and-hold-ahead-message').show(); // Step 2: user must go forward
		}).init(function () {
		  $('.move-and-hold-ahead-message').hide(); // GPS hack is enabled
		});
		
		navigator.geolocation.getCurrentPosition(me.updateCurrentLocationModel);

		setInterval(function() {
			navigator.geolocation.getCurrentPosition(me.updateCurrentLocationModel);
		}, 1000);
		
	},
	updateCurrentLocationModel: function (location) {
		CurrentLocation.setCoords(location.coords);
	}
});

var MainView = new View({
	updateCurrentPositon: function (location) {
	},
	init: function () {
		
		CurrentLocation.addEventListener("update", function () {
			//console.log(this.getCoords());
		});
		
		Compass.watch(function (heading) {
		  //$('#compass').text(heading);
		  $('#compass').css('transform', 'rotate(' + (-heading) + 'deg)');
		});
	}
});