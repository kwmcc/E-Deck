ig.module( 'game.entities.cool' )
.requires( 'impact.entity', 'impact.entity-pool' )
.defines(function() {
	EntityCool = ig.Entity.extend({

		animSheet: new ig.AnimationSheet( 'media/art/cool.png', 16, 16),
		zIndex: -1,
		size: {x: 8, y: 16},
		offset: {x: 4, y: 0},

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

	//Enable Pooling for Coolant Cores
	ig.EntityPool.enableFor( EntityCool );
});