
ig.module( 'game.entities.events' )
.requires( 'impact.entity' )
.defines(function() {
	EntityEvents = ig.Entity.extend({
	
	timeAllocated: [50, 30 ,30 ,60],
	penalty: [50, 20, 30, 60],
	reward: [50,20,30,60],
	primarySystem: ['one', 'two', 'three', 'four'],


		init: function( x, y, settings ) {
			this.parent( x, y, settings );
		},

		

		update: function() {
			this.parent();
		}

	});
});