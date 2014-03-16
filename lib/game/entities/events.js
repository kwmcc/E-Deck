
ig.module( 'game.entities.events' )
.requires( 'impact.entity' )
.defines(function() {
	EntityEvents = ig.Entity.extend({
	
	timeAllocated: [50, 50 ,60 ,60, 40, 50],
	penalty: [20, 20, 40, 60, 50, 100],
	reward: [30, 20, 40, 60, 70, 100],
	numEvents: 6,

	//can read: engines, shields, weapons lifesupport sensors, cloaking
	primarySystem: ['ENGINES', 'SHIELDS', 'WEAPONS', 'SENSORS', 'CLOAKING', 'LIFE SUPPORT'],

	captiansOrd: 
	["Pirates are inbound!" + "\n"
	 + "More Power to Engines!", 
	"They are here!" + "\n"
	  + "Power to Shields!",
	"We are hurting!" + "\n"
	+"Power to weapons!" + "\n" +
	  "Let's finish this...",
	"Cowards...distress call," +  "\n"
	 + "boost the sensors...", 
	"OH GOD LOOK AT THAT," + "\n" 
	 + "power up the cloaking system!",
	 "\n" + "We've almost made it... Power to Life Support!"],

	captiansLament:
	["They are bearing down on us!", "Shields Down!", "They are getting away!", "All quiet...", "They found us! Oh GOD,.,., beh...."],

		init: function( x, y, settings ) {
			this.parent( x, y, settings );
		},

		

		update: function() {
			this.parent();
		}

	});
});