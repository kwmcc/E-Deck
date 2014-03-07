ig.module( 'game.entities.fuel' )
.requires( 'impact.entity', 'impact.entity-pool' )
.defines(function() {
	EntityFuel = ig.Entity.extend({

		animSheet: new ig.AnimationSheet( 'media/art/fuel.png', 16, 16),
		zIndex: -1, 
		size: {x: 9, y: 13},
		offset: {x: 4, y: 2},

		init: function( x, y, settings ) {
			this.parent( x, y, settings );
			this.addAnim('default', 1, [0]);
		},

		reset: function (x, y, settings) {
			this.parent(x, y, settings);
		},

		update: function() {
			this.parent();
			this.currentAnim = this.anims.default;
		}

	});

	//Enable Pooling for Fuel Cores
	ig.EntityPool.enableFor(EntityFuel);
});