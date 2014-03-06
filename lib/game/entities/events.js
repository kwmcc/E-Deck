
ig.module( 'game.entities.events' )
.requires( 'impact.entity' )
.defines(function() {
	EntityEvents = ig.Entity.extend({
	
	timeAllocated: [50, 30 ,30 ,60],
	penalty: [50, 20, 30, 60],
	reward: [50,20,30,60],

	//can read: engines, shields, weapons lifesupport sensors, cloaking
	primarySystem: ['engines', 'shields', 'weapons', 'sensors'],


		init: function( x, y, settings ) {
			this.parent( x, y, settings );
		},

		

		update: function() {
			this.parent();
		}

	});
});