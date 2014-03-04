ig.module( 'game.entities.cool' )
//.requires( 'game.entities.common.core' )
.requires( 'impact.entity' )
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

		/*check: function(other) {
			this.parent();
			if(other.hasFuel || other.hasCool) {
				console.log('Player already has a Core');
			}
			else if (!other.hasCool) {
				other.hasCool = true;
				this.kill();
				console.log('Player has picked up a Coolant Core');
			}
		},*/

		update: function() {
			this.parent();
			this.currentAnim = this.anims.default;
		}

	});
});