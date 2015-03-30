App.view = App.view || {};
App.view.Compass = new Class(App.View);

App.view.Compass.extend({
	directionArrowEl: '#direction .direction-arrow',
	headingEl: '#heading',
	compassShieldEl: "#compass .shield",
	headDirectionArrow: function(heading) {
		var me = this;
		var bearing = DestinationLocation.getValue('bearing');
		$(me.compassShieldEl).css('transform', 'rotate(' + (-heading) + 'deg)');
		$(me.directionArrowEl).css('transform', 'rotate(' + (-heading + bearing) + 'deg)');
		$(me.headingEl).text(heading.toFixed());
	},
	initialize: function () {
		var me = this;
		Compass.watch((function(scope) {
			return function(heading) {
				scope.headDirectionArrow.call(scope, heading);
			}
		}(me)));
	}
});