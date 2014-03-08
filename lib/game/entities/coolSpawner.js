ig.module( 'game.entities.coolSpawner' )
.requires( 'impact.entity', 'impact.entity-pool' )
.defines(function() {
	EntityCoolSpawner = ig.Entity.extend({

		coolCheck: null,

		init: function( x, y, settings ) {
			this.parent( x, y, settings );
		},

		update: function() {
			this.parent();
			this.coolCheck = ig.game.getEntitiesByType(EntityCool);
			for (var i = 0; i < this.coolCheck.length; i++) {
				if(!this.touches(this.coolCheck[i])) {
					ig.game.spawnEntity(EntityCool, this.pos.x, this.pos.y);
				}
			}
		}

		/*update: function() {

		}*/
	});
});