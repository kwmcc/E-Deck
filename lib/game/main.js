ig.module(
    'game.main'
)
.requires(
    'impact.game',
    'impact.font',
    'plugins.joncom.font-sugar.font',
    'plugins.notification-manager',
    'game.levels.havok'
    //'impact.debug.debug'
)
.defines(function(){

EDeck = ig.Game.extend({

    font: new ig.Font('media/font.png', {fontColor: '#FFF'}), //primary font
    borderFont: new ig.Font('media/font.png', {fontColor: '#01DF3A', borderColor: '#000'}),
    iconFuelOn: new ig.Image( 'media/art/fuelOn.png'),
    iconFuelOff: new ig.Image( 'media/art/fuelOff.png'),
    iconCoolOn: new ig.Image( 'media/art/coolantOn.png'),
    iconCoolOff: new ig.Image( 'media/art/coolantOff.png'),
    imgShields: new ig.Image('media/art/system_shields.png'),
    imgCloaking: new ig.Image('media/art/system_cloaking.png'),
    imgEngines: new ig.Image('media/art/system_engines.png'),
    imgWeapons: new ig.Image('media/art/system_weapons.png'),
    imgLifeSupport: new ig.Image('media/art/system_lifeSupport.png'),
    imgSensors: new ig.Image('media/art/system_sensors.png'),
    imgFuel: new ig.Image('media/art/fuel.png'),
    imgCool: new ig.Image('media/art/cool.png'),
    
    //mission varaibles.
    voyageCounter : 50, //over all progress through the game
    eventTime : 0, //the current time in the event
    eventVictory : false, //the primary victory condition of the event.
    gameStatus: 0, //0 = no change, 1 = win, 2 = lose
    
    //event varaibles
    primarySystem: null,
    timeAllocated : 50, //this is the time allocated by the event
    reward : 50, //reward for suceeding in an event.
    penalty : -50, //penalty for failing to complete an event.
    
    //the temporary system for primary
    system : null,
    
    //system global variables
    sysEngines: null,
    sysShields: null,
    sysCloaking: null,
    sysWeapons: null,
    sysLifesupport: null,
    sysSensors: null,
       
    //the current event
    newEvent: true,
    currEvent: null,
    eventNum: 0,
    captiansOrd: null,
    
    //player variables
    player : null,

    //Orders screen stuff
    ordersScreen: false,
    infoScreen: false,
    overlay: new ig.Image('media/art/overlay.png'),


    init: function() {

        // Bind keys.
        ig.input.bind(ig.KEY.UP_ARROW, 'up');
        ig.input.bind(ig.KEY.DOWN_ARROW, 'down');
        ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
        ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
        ig.input.bind(ig.KEY.W, 'up');
        ig.input.bind(ig.KEY.S, 'down');
        ig.input.bind(ig.KEY.A, 'left');
        ig.input.bind(ig.KEY.D, 'right');
        ig.input.bind(ig.KEY.SPACE, 'act');
        ig.input.bind(ig.KEY.F, 'drop');
        ig.input.bind(ig.KEY.TAB, 'orders');
        ig.input.bind(ig.KEY.I, 'info');
        ig.input.bind(ig.KEY.M, 'mute');
        
        //play the background music
        ig.music.add('media/audio/Revised_BGM.*');
        ig.music.volume = 0.5;
        ig.music.play();

        //load event
        this.currEvent = this.getEntitiesByType( EntityEvents )[0];
      
        // Load level.
        this.loadLevel(LevelHavok);
    },

    update: function() {
        //screen control
        if(ig.input.pressed('orders') && !this.ordersScreen) {
        	if(this.infoScreen) this.infoScreen = false;
        	this.ordersScreen = true;
        } else if(ig.input.pressed('orders') && this.ordersScreen) this.ordersScreen = false;
        if(ig.input.pressed('info') && !this.infoScreen) {
        	if(this.ordersScreen) this.ordersScreen = false;
        	this.infoScreen = true;
        } else if(ig.input.pressed('info') && this.infoScreen) this.infoScreen = false;
        
        //mute control
        if(ig.input.pressed('mute') && !ig.music.volume == 0.0) ig.music.volume = 0.0;
        else if(ig.input.pressed('mute')) ig.music.volume = 0.5;
        this.parent();
    },

    draw: function() {
        this.parent();

        //Get Entities
        sysEngines = this.getEntitiesByType( EntityEngines )[0];
        sysShields = this.getEntitiesByType( EntityShields )[0];
        sysCloaking = this.getEntitiesByType( EntityCloaking )[0];
        sysWeapons = this.getEntitiesByType( EntityWeapons )[0];
        sysLifesupport = this.getEntitiesByType( EntityLifesupport )[0];
        sysSensors = this.getEntitiesByType( EntitySensors )[0];
        player = this.getEntitiesByType( EntityPlayer )[0];

        //follow camera mode
        if(player) {
            this.screen.x = player.pos.x - ig.system.width/2;
            this.screen.y = player.pos.y - ig.system.height/2;
        }
        
        //draw core indicators
        if(player.hasFuel) {
        	this.iconFuelOn.draw(ig.system.width - this.iconFuelOn.width, 2);
        } else {
        	this.iconFuelOff.draw(ig.system.width - this.iconFuelOff.width, 2);
        }
        if(player.hasCool) {
        	this.iconCoolOn.draw(ig.system.width - this.iconCoolOn.width - 15, 3);
        } else {
        	this.iconCoolOff.draw(ig.system.width - this.iconCoolOn.width - 15,3);
        }

        //this sets up the next event where needed.
        if(this.newEvent){
	        //load event
	        this.currEvent = this.getEntitiesByType( EntityEvents )[0];

	        //this sets up the global variables for the new event
	        this.setUpEvent();

	        this.newEvent = false;

            if(this.eventNum != this.currEvent.numEvents - 1){ //makes sure it does not hop off end of array
                this.eventNum++; //need to check for array out of bounds at the end of the event.
            }
	        
        }

        //Orders Screen
		if(this.ordersScreen) {
			this.overlay.draw(0,0);
			var x = ig.system.width/2;
			this.borderFont.draw("CAPTAIN: \n" + 
								 this.currEvent.captiansOrd[this.eventNum -1], x, 30, ig.Font.ALIGN.CENTER);
			this.borderFont.draw('EVENT: ' + this.eventTime + '/' + this.timeAllocated, x, ig.system.height - this.font.height*5, ig.Font.ALIGN.CENTER);
	        this.borderFont.draw('VOYAGE: ' + this.voyageCounter + '/' + 200, x, ig.system.height - this.font.height*4, ig.Font.ALIGN.CENTER);

			this.font.draw('KEY      [#FF0000 <I>]', x, ig.system.height - this.font.height*2, ig.Font.ALIGN.CENTER);
			this.font.draw('RETURN [#FF0000 <TAB>]', x, ig.system.height - this.font.height, ig.Font.ALIGN.CENTER);
		}

		//Key Window
		if(this.infoScreen) {
			this.overlay.draw(0,0);
			x = 7;
			y = 27;
			var x2 = ig.system.width/2 + 5;
			var tx = x + 38;
			var tx2 = x2 + 38;
			var ty = y + 16;
			var offset = 40;
			this.borderFont.draw("SYSTEMS AND CORES", ig.system.width/2, this.font.height, ig.Font.ALIGN.CENTER);
			
			//left set
			this.imgShields.draw(x, y, 0, 0, 32, 32);
			this.font.draw("SHIELDS", tx, ty);
			this.imgCloaking.draw(x, y + offset, 0, 0, 32, 32);
			this.font.draw("CLOAKING", tx, ty + offset);
			this.imgEngines.draw(x, y + offset*2, 0, 0, 32, 32);
			this.font.draw("ENGINES", tx, ty + offset*2);
			this.imgFuel.draw(x + 16 - this.imgFuel.width/2, y + 16 - this.imgFuel.height/2 + offset*3);
			this.font.draw("FUEL CORE", tx, ty + offset*3);
			
			//right set
			this.imgWeapons.draw(x2, y, 0, 0, 32, 32);
			this.font.draw("WEAPONS", tx2, ty);
			this.imgLifeSupport.draw(x2, y + offset, 0, 0, 32, 32);
			this.font.draw("LIFE SUPPORT", tx2, ty + offset);
			this.imgSensors.draw(x2, y + offset*2, 0, 0, 32, 32);
			this.font.draw("SENSORS", tx2, ty + offset*2);
			this.imgCool.draw(x2 + 16 - this.imgCool.width/2, y + 16 - this.imgCool.height/2 + offset*3);
			this.font.draw("COOLANT CORE", tx2, ty + offset*3);

			this.font.draw('ORDERS [#FF0000 <TAB>]', ig.system.width/2, ig.system.height - this.font.height*2, ig.Font.ALIGN.CENTER);
			this.font.draw('EXIT     [#FF0000 <I>]', ig.system.width/2, ig.system.height - this.font.height, ig.Font.ALIGN.CENTER);
		}

		//draw UI text if not in Orders screen
		if(!this.ordersScreen && ! this.infoScreen) {        
	        this.borderFont.draw('EVENT: ' + this.eventTime + '/' + this.timeAllocated, 2, (ig.system.height - this.font.height - 1), ig.Font.ALIGN.LEFT);
	        this.borderFont.draw('VOYAGE: ' + this.voyageCounter + '/' + 200, ig.system.width - 1, (ig.system.height - this.font.height - 1), ig.Font.ALIGN.RIGHT);
	        this.borderFont.draw('SYSTEM: \n' + this.primarySystem, 2, 2, ig.Font.ALIGN.LEFT);
	        //this.borderFont.draw('Captain: \n' + this.currEvent.captiansOrd[this.eventNum -1],  2, 2, ig.Font.ALIGN.LEFT);
        }

        if(player.hasMoved){
            this.checkingEv(); //iterates event time and applicable heat counters, handles win conditions
            //this checks for the win condition gameover screen should be in the else satement. 
            
            //this should prevent event overflow
            if(this.eventNum > this.numEvents){
            this.gameStatus = 2;
            }

            if(this.gameStatus == 1 || this.voyageCounter >= 200){
                console.log("YOU WIN THE GAME!!!! Voyage Counter: " + this.voyageCounter);
                 ig.system.setGame(GameWinScreen) 
            }else if(this.gameStatus == 2 || this.voyageCounter < 0){
                console.log("YOU LOSE THE GAME!!! GOOD DAY SIR! Voyage Counter: " + this.voyageCounter);
                 ig.system.setGame(GameOverScreen) 
            }
            player.hasMoved = false;
        }
        
    },

    checkingEv : function() {
            
            if(this.eventTime > this.timeAllocated-1){

                //set primary system
                if(this.primarySystem == 'ENGINES'){
                    sysEngines.isPrimary = true;
                    system = sysEngines;
                    console.log("Eng. is primary.");

                }else if(this.primarySystem == 'SHIELDS'){
                    sysShields.isPrimary = true;
                    system = sysShields;
                    console.log("sheild is primary.");

                }else if(this.primarySystem == 'CLOAKING'){
                    sysCloaking.isPrimary = true;
                    system = sysCloaking;
                    console.log("cloak is primary.");

                }else if(this.primarySystem == 'WEAPONS'){
                    sysWeapons.isPrimary = true;
                    system = sysWeapons;
                    console.log("wep. is primary.");

                }else if(this.primarySystem == 'LIFE SUPPORT'){
                    sysLifesupport.isPrimary = true;
                    system = sysLifesupport;
                    console.log("LS is primary.");

                }else if(this.primarySystem == 'SENSORS'){
                    sysSensors.isPrimary = true;
                    system = sysSensors;
                    console.log("sensors is primary.");

                }else{
                    console.log("no primary system found.");
                }

                //this checks the primary system of the event to see if it has been fueled.
                //this check should only happen once per event at the very end.

                //find the primary system in the event.
                if(sysEngines.isPrimary && sysEngines.isFueled){
                    this.eventVictory = true; //sets event victory to true
                    sysEngines.isFueled = false; //resets the system for next event
                    console.log("Primary system: " + this.primarySystem + " is fueled.");
                }else if(sysShields.isPrimary && sysShields.isFueled){
                    this.eventVictory = true; //sets event victory to true
                    sysShields.isFueled = false; //resets the system for next event
                    console.log("Primary system: " + this.primarySystem + " is fueled.");
                }else if(sysWeapons.isPrimary && sysWeapons.isFueled){
                    this.eventVictory = true; //sets event victory to true
                    sysWeapons.isFueled = false; //resets the system for next event
                    console.log("Primary system: " + this.primarySystem + " is fueled.");
                }else if(sysLifesupport.isPrimary && sysLifesupport.isFueled){
                    this.eventVictory = true; //sets event victory to true
                    sysLifesupport.isFueled = false; //resets the system for next event
                    console.log("Primary system: " + this.primarySystem + " is fueled.");
                }else if(sysSensors.isPrimary && sysSensors.isFueled){
                    this.eventVictory = true; //sets event victory to true
                    sysSensors.isFueled = false; //resets the system for next event
                    console.log("Primary system: " + this.primarySystem + " is fueled.");
                }else if(sysCloaking.isPrimary && sysCloaking.isFueled){
                    this.eventVictory = true; //sets event victory to true
                    sysCloaking.isFueled = false; //resets the system for next event
                    console.log("Primary system: " + this.primarySystem + " is fueled.");
                }

                if(this.eventVictory && this.gameStatus == 0){
                    this.eventTime = 0; //resets the time for the event
                    console.log("Event Success! Reward: " + this.reward);
                    this.voyageCounter += this.reward;
                    this.newEvent = true;
                    this.resetSystems();
                    this.eventVictory = false;
                    console.log("Voyage Counter : " + this.voyageCounter);
                    if(this.voyageCounter > 200){
                        this.gameStatus = 1;
                    }
                }else if(this.gameStatus == 0){
                    this.eventTime = 0; //resets the time for the event
                    console.log("Event Failure! Penalty: " + this.penalty);
                    this.voyageCounter = this.voyageCounter - this.penalty;
                    this.newEvent = true;
                    this.resetSystems();
                    this.eventVictory = false;
                
                    console.log("Voyage Counter : " + this.voyageCounter);
                    if(this.voyageCounter <= 0){
                        this.gameStatus = 2;
                    }
                }
            }else{
                //incriments the event time
                this.eventTime ++; 

                //this is were the program should run through all the systems, and incriment the heat of each
                if(sysEngines.isHeating){
                   sysEngines.heat++;
                    console.log("engine heat increases to: " + sysEngines.heat);
                }
                if(sysShields.isHeating){
                   sysShields.heat++;
                    console.log("sheild heat increases to: " + sysShields.heat);
                }
                if(sysCloaking.isHeating){
                    sysCloaking.heat++;
                    console.log("cloak heat increases to: " + sysCloaking.heat);
                }
                if(sysWeapons.isHeating){
                    sysWeapons.heat++;
                    console.log("weapons heat increases to: " + sysWeapons.heat);
                }
                if(sysLifesupport.isHeating){
                    sysLifesupport.heat++;
                    console.log("LS heat increases to: " + sysLifesupport.heat);
                }
                if(sysSensors.isHeating){
                    sysSensors.heat++;
                    console.log("sensors heat increases to: " + sysSensors.heat);
                }else{
                   // console.log("nothing to heat.");
                }


                if(sysEngines.isOverHeated){
                    sysEngines.isHeating = false;
                    this.voyageCounter = this.voyageCounter - 1;
                    console.log("engine overheating");
                }
                if(sysShields.isOverHeated){
                    sysShields.isHeating = false;
                   this.voyageCounter = this.voyageCounter - 1;
                    console.log("sheild  overheating");
                }
                if(sysCloaking.isOverHeated){
                    sysEngines.isHeating = false;
                    this.voyageCounter = this.voyageCounter - 1;
                    console.log("cloak overheating");
                }
                if(sysWeapons.isOverHeated){
                    sysEngines.isHeating = false;
                    this.voyageCounter = this.voyageCounter - 1;
                    console.log("weapons overheating");
                }
                if(sysLifesupport.isOverHeated){
                    sysEngines.isHeating = false;
                    this.voyageCounter = this.voyageCounter - 1;
                    console.log("LS overheating");
                }
                if(sysSensors.isOverHeated){
                    sysEngines.isHeating = false;
                    this.voyageCounter = this.voyageCounter - 1;
                    console.log("sensors  overheating");
                }

            }
        },

    //this function sets up a new event when needed.
    setUpEvent: function() {

        console.log('event :' + this.eventNum);
  
        this.timeAllocated = this.currEvent.timeAllocated[this.eventNum];
        console.log('time allocated: ' + this.timeAllocated);

        this.reward = this.currEvent.reward[this.eventNum];
        console.log('reward: ' + this.reward);

        this.penalty = this.currEvent.penalty[this.eventNum];
        console.log('time penalty: '  + this.penalty);

        this.primarySystem = this.currEvent.primarySystem[this.eventNum];
        console.log('primary system: ' + this.primarySystem);

        this.captiansOrd = this.currEvent.captiansOrd[this.eventNum];

    },

    //resets system booleans back to normal.
    resetSystems: function() {
                console.log("Resetting Systems!!");
                sysEngines.isPrimary = false;
                sysEngines.isFueled = false;
                sysEngines.isCooled = false;

                sysShields.isPrimary = false;
                sysShields.isFueled = false;
                sysShields.isCooled = false;

                sysWeapons.isPrimary = false;
                sysWeapons.isFueled = false;
                sysWeapons.isCooled = false;

                sysCloaking.isPrimary = false;
                sysCloaking.isFueled = false;
                sysCloaking.isCooled = false;

                sysLifesupport.isPrimary = false;
                sysLifesupport.isFueled = false;
                sysLifesupport.isCooled = false;

                sysSensors.isPrimary = false;
                sysSensors.isFueled = false;
                sysSensors.isCooled = false;

                this.eventVictory = false;

    },
   
});

MenuScreen = ig.Game.extend({
    font: new ig.Font('media/font.png', {fontColor: '#FFF'}),
    borderFont: new ig.Font('media/font.png', {fontColor: '#01DF3A', borderColor: '#000'}),
    background: new ig.Image('media/art/mainbg.png'),
    title: new ig.Image('media/art/mainoverlay.png'),
    overlay: new ig.Image('media/art/overlay.png'),
    imgShields: new ig.Image('media/art/system_shields.png'),
    imgCloaking: new ig.Image('media/art/system_cloaking.png'),
    imgEngines: new ig.Image('media/art/system_engines.png'),
    imgWeapons: new ig.Image('media/art/system_weapons.png'),
    imgLifeSupport: new ig.Image('media/art/system_lifeSupport.png'),
    imgSensors: new ig.Image('media/art/system_sensors.png'),
    imgFuel: new ig.Image('media/art/fuelOn.png'),
    imgCool: new ig.Image('media/art/coolantOn.png'),
    instructScreen: false,
    creditsScreen: false,
    infoScreen: false,

    init: function() {
        ig.input.bind(ig.KEY.SPACE, 'start');
        ig.input.bind(ig.KEY.TAB, 'instruct');
        ig.input.bind(ig.KEY.I, 'key');
        ig.input.bind(ig.KEY.C, 'credits');
        ig.input.bind(ig.KEY.ESC, 'exit');
    },

    update: function() {
        if(ig.input.pressed('start')) ig.system.setGame(EDeck)
        if(ig.input.pressed('instruct') && !this.instructScreen) {
        	if(this.creditsScreen) this.creditsScreen = false;
        	if(this.infoScreen) this.infoScreen = false;
        	this.instructScreen = true;
        }
        if(ig.input.pressed('credits') && !this.creditsScreen) {
        	if(this.instructScreen) this.instructScreen = false;
        	if(this.infoScreen) this.infoScreen = false;
        	this.creditsScreen = true;
        }
        if(ig.input.pressed('key') && !this.infoScreen) {
        	if(this.instructScreen) this.instructScreen = false;
        	if(this.creditsScreen) this.creditsScreen = false;
        	this.infoScreen = true;
        }
        if(ig.input.pressed('exit')) {
        	this.instructScreen = false;
        	this.creditsScreen = false;
        	this.infoScreen = false;
        }
        this.parent();
    },

    draw: function() {
        this.parent();
        this.background.draw(0,0);
        this.title.draw(0,0);
        var x = 4;
        var y = 50;
        this.font.draw('[#0B0B3B START GAME]       [#FF0000 <SPACE>] \n \n' +
					   '[#0B0B3B INSTRUCTIONS]       [#FF0000 <TAB>] \n \n' +
        			   '[#0B0B3B SYSTEMS AND CORES    [#FF0000 <I>] \n \n' +
        			   '[#0B0B3B CREDITS]              [#FF0000 <C>] \n \n', x, y);

        //Instructions Window
		if(this.instructScreen) {
			this.overlay.draw(0,0);
			x = 6;
			y = this.font.height * 3;
			this.borderFont.draw("INSTRUCTIONS", ig.system.width/2, this.font.height, ig.Font.ALIGN.CENTER);
			this.font.draw('USE [#FF0000 WASD] OR [#FF0000 ARROWS] TO MOVE. \n \n' +
        			   	   '[#FF0000 SPACE] PICKS UP CORES & ACTIVATES SYSTEMS. \n' +
        			   	   '[#FF0000 F] WILL DROP A HELD CORE. \n \n' + 
        			   	   '[#FF0000 TAB] BRINGS UP THE CAPTAIN\'S LAST ORDER. \n' +
        			   	   '[#FF0000 I] OPENS THE SYSTEM AND CORE KEY. \n \n' +
        			   	   '[#FF0000 M] MUTES THE GAME. \n \n' +
        			   	   'THE CAPTAIN WILL ORDER YOU TO POWER A\n' +
        			   	   'SYSTEM. ACTIVATE THAT SYSTEM WHILE \n' +
        			   	   'HOLDING A FUEL CORE TO POWER IT UP. \n' +
        			   	   'YOU SHOULD ALSO PUT COOLANT IN THE \n' +
        			   	   'SYSTEM TO PREVENT IT FROM OVERHEATING.', x, y);
			this.font.draw('KEY    [#FF0000 <I>]', ig.system.width/2, ig.system.height - this.font.height*2, ig.Font.ALIGN.CENTER);
			this.font.draw('EXIT [#FF0000 <ESC>]', ig.system.width/2, ig.system.height - this.font.height, ig.Font.ALIGN.CENTER);
		}

		//Key Window
		if(this.infoScreen) {
			this.overlay.draw(0,0);
			x = 7;
			y = 27;
			var x2 = ig.system.width/2 + 5;
			var tx = x + 38;
			var tx2 = x2 + 38;
			var ty = y + 16;
			var offset = 40;
			this.borderFont.draw("SYSTEMS AND CORES", ig.system.width/2, this.font.height, ig.Font.ALIGN.CENTER);
			
			//left set
			this.imgShields.draw(x, y, 0, 0, 32, 32);
			this.font.draw("SHIELDS", tx, ty);
			this.imgCloaking.draw(x, y + offset, 0, 0, 32, 32);
			this.font.draw("CLOAKING", tx, ty + offset);
			this.imgEngines.draw(x, y + offset*2, 0, 0, 32, 32);
			this.font.draw("ENGINES", tx, ty + offset*2);
			this.imgFuel.draw(x + 16 - this.imgFuel.width/2, y + 16 - this.imgFuel.height/2 + offset*3);
			this.font.draw("FUEL CORE", tx, ty + offset*3);
			
			//right set
			this.imgWeapons.draw(x2, y, 0, 0, 32, 32);
			this.font.draw("WEAPONS", tx2, ty);
			this.imgLifeSupport.draw(x2, y + offset, 0, 0, 32, 32);
			this.font.draw("LIFE SUPPORT", tx2, ty + offset);
			this.imgSensors.draw(x2, y + offset*2, 0, 0, 32, 32);
			this.font.draw("SENSORS", tx2, ty + offset*2);
			this.imgCool.draw(x2 + 16 - this.imgCool.width/2, y + 16 - this.imgCool.height/2 + offset*3);
			this.font.draw("COOLANT CORE", tx2, ty + offset*3);

			this.font.draw('INSTRUCTIONS [#FF0000 <TAB>]', ig.system.width/2, ig.system.height - this.font.height*2, ig.Font.ALIGN.CENTER);
			this.font.draw('EXIT         [#FF0000 <ESC>]', ig.system.width/2, ig.system.height - this.font.height, ig.Font.ALIGN.CENTER);
		}

		//Credits Window
		if(this.creditsScreen) {
			this.overlay.draw(0,0);
			x = 6;
			var bx = ig.system.width - 6;
        	y = 50;
        	var fh = this.font.height;
			this.borderFont.draw("CREDITS", ig.system.width/2, this.font.height, ig.Font.ALIGN.CENTER);
			this.font.draw('CODE/LEVEL DESIGN:', x, y);
        	this.borderFont.draw('Kevin McCotter', bx, y, ig.Font.ALIGN.RIGHT);
        	this.font.draw('CODE/MISSION DESIGN:', x, y + fh*3);
        	this.borderFont.draw('Andrew Miller', bx, y + fh*3, ig.Font.ALIGN.RIGHT);
    	    this.font.draw('SOUND DESIGN:', x, y + fh*6);
    	    this.borderFont.draw('Robert Ho', bx, y + fh*6, ig.Font.ALIGN.RIGHT);
    	    this.font.draw('GRAPHICAL DESIGN:', x, y + fh*9);
    	    this.borderFont.draw('Martina Stepisnik', bx, y + fh*9, ig.Font.ALIGN.RIGHT);
			this.font.draw('EXIT [#FF0000 <ESC>]', ig.system.width/2, ig.system.height - this.font.height, ig.Font.ALIGN.CENTER);
		}
    }
});

GameWinScreen = ig.Game.extend({
    font: new ig.Font('media/font.png', {fontColor: '#FFF'}),
    background: new ig.Image('media/art/winner.png'),

    init: function() {
        ig.input.bind(ig.KEY.ESC, 'menu');
    },

    update: function() {
        if(ig.input.pressed('menu')) ig.system.setGame(MenuScreen)
        this.parent();
    },

    draw: function() {
        this.parent();
        this.background.draw(0,0);
        var x = ig.system.width/2;
        var y = ig.system.height/2;
        this.font.draw('MENU [#FF0000 <ESC>]', x, ig.system.height - this.font.height, ig.Font.ALIGN.CENTER);

    }
});

GameOverScreen = ig.Game.extend({
    font: new ig.Font('media/font.png', {fontColor: '#FFF'}),
    dayumShame: new ig.Image('media/art/dayumShame.png'),
    background: new ig.Image('media/art/loser.png'),
    yesCatNoCat: false,    

    init: function() {
        ig.input.bind(ig.KEY.SPACE, 'restart');
        ig.input.bind(ig.KEY.ESC, 'menu');
        var explosion = new ig.Sound('media/audio/explosion.*',false);
        explosion.play();
        ig.music.stop();
        this.yesCatNoCat = this.determine();
    },

    determine: function() {
    	var r = Math.floor(Math.random() * (100 - 1 + 1)) + 1;
    	if(r%50 == 0) return true;
    	else return false;
    },

    update: function() {
        if(ig.input.pressed('menu')) ig.system.setGame(MenuScreen)
        else if (ig.input.pressed('restart')) ig.system.setGame(EDeck)
        this.parent();
    },

    draw: function() {
        this.parent();
        this.background.draw(0,0);
        var x = ig.system.width/2;
        var y = ig.system.height/2;
        if(this.yesCatNoCat) this.dayumShame.draw(x - this.dayumShame.width/2, y - this.dayumShame.height/2);
        this.font.draw('RESTART [#FF0000 <SPACE>]', x, ig.system.height - (this.font.height*2), ig.Font.ALIGN.CENTER);
        this.font.draw('MENU      [#FF0000 <ESC>]', x, ig.system.height - this.font.height, ig.Font.ALIGN.CENTER);

    }
});

ig.main( '#canvas', MenuScreen, 60, 300, 220, 2 );

});