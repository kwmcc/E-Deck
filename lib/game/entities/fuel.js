ig.module( 'game.entities.fuel' )
//.requires( 'game.entities.common.core' )
.requires( 'impact.entity' )
.defines(function() {
	EntityFuel = ig.Entity.extend({

		animSheet: new ig.AnimationSheet( 'media/art/fuel.png', 16, 16),
		zIndex: -1, 
		size: {x: 10, y: 10},
		offset: {x: 3, y: 3},

		init: function( x, y, settings ) {
			this.parent( x, y, settings );
			this.addAnim('default', 1, [0]);
		},

		/*check: function(other) {
			this.parent();
			if(other.hasFuel || other.hasCool) {
				console.log('Player already has a Core');
			}
			else if (!other.hasFuel) {
				other.hasFuel = true;
				this.kill();
				console.log('Player has picked up a Fuel Core');
			}
		},*/

		update: function() {
			this.parent();
			this.currentAnim = this.anims.default;
		}

	});
});
