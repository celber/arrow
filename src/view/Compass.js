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