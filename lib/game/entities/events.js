
ig.module( 'game.entities.events' )
.requires( 'impact.entity' )
.defines(function() {
	EntityEvents = ig.Entity.extend({
	
	timeAllocated: [40, 50 ,60 ,60, 50, 50],
	penalty: [20, 20, 40, 60, 50, 100],
	reward: [30, 20, 40, 60, 70, 100],
	numEvents: 6,

	//can read: engines, shields, weapons lifesupport sensors, cloaking
	primarySystem: ['Engines', 'Shields', 'Weapons', 'Sensors', 'Cloaking'],
	captiansOrd: 
	["Pirates are inbound!" + "\n"
	 + "More Power to Engines!", 
	"They are here!" + "\n"
	  + "Power to Sheilds!",
	"We are hurting!" + "\n"
	+"Power to weapons!" + "\n" +
	  "Lets finish this...",
	"Cowards...distress call," +  "\n"
	 + "boost the sensors...", 
	"OH GOD LOOK AT THAT," + "\n" 
	 + "power up the cloaking system!"],

	captiansLament:
	["They are bearing down on us!", "Sheilds Down!", "They are getting away!", "All quiet...", "They found us! Oh GOD,.,., beh...."],

		init: function( x, y, settings ) {
			this.parent( x, y, settings );
		},

		

		update: function() {
			this.parent();
		}

	});
});