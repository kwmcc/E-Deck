
ig.module( 'game.entities.events' )
.requires( 'impact.entity' )
.defines(function() {
	EntityEvents = ig.Entity.extend({
	
	timeAllocated: [50, 50 ,60 ,60, 50, 60, 50],
	penalty: [20, 20, 40, 60, 50, 80, 90],
	reward: [30, 20, 40, 60, 70, 80, 90],
	numEvents: 8,

	//can read: engines, shields, weapons lifesupport sensors, cloaking

	primarySystem: ['ENGINES', 'SHIELDS', 'WEAPONS', 'SENSORS', 'ENGINES', 'CLOAKING','LIFE SUPPORT','Out of Bounds!'],

	captiansOrd: 

	["Pirates are inbound!" + "\n" + "This cargo needs to get to Earth!" + "\n"
	 + "More Power to Engines!", 

	"They're right on top of us!" +"\n" +"Maybe we can lose them in that " + "\n" + "asteroid feild!" + "\n"
	  + "Boost Power to Shields!",

	"Woooo! Look at that!" + "\n" + "They fly like drunken Zonkoguses!" + "\n"
	+"We are coming about!" + "\n" + "Power to weapons!" + "\n" +
	  "Let's finish this...",

	"Cowards..." + "\n" +  "They sent out a distress call," +  "\n"
	 + "boost the sensors... " + "\n" + "Maybe we can jam it until we " + "\n" + "are out of range.", 

	"OH GOD LOOK AT THE GUNS ON THAT!" + "\n" 
	 + "We've gotta go now!!" + "\n" + "Give her all she's got!" + "\n" + "Power to Engines!",

	 "In the shadow of the Moon now..." + "\n" + "Leaf on the wind..." +"\n" + "Power up the cloak..." + "\n" + "We might just make it...",

	 "We've almost made it..." +"\n" +"Power to Life Support, we need to mask our vitals!" + "\n" + "Hopefully our cargo of Mayo-tech" +"\n" + 
	 "Fuel Cells won't spoil...",
	 "OUT OF BOUNDS!"],

		init: function( x, y, settings ) {
			this.parent( x, y, settings );
		},

		

		update: function() {
			this.parent();
		}

	});
});