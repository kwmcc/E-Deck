ig.module(
    'game.main'
)
.requires(
    'impact.game',
    'impact.font',
    'plugins.joncom.font-sugar.font',
    'plugins.notification-manager',
    //'game.levels.demo',
    //'game.levels.minerva',
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

    //NOTIFICATION MANAGER FROM PLUG IN
    myNoteMgr: new ig.NotificationManager(),

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
        ig.input.bind(ig.KEY.E, 'act');
        ig.input.bind(ig.KEY.SPACE, 'act');
        ig.input.bind(ig.KEY.F, 'drop');
        
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
        
        this.myNoteMgr.update();
        //this.myNoteMgr.lifetime = 100;
        //this.myNoteMgr.fadetime = 10;
        this.parent();
    },

    //this camera is fixed with the level centered
    draw: function() {
        this.parent();

        
        //this.myNoteMgr.spawn('media/04b03.font.png', "hello world",  6, 6, ig.Font.ALIGN.LEFT);
        //this.myNoteMgr.draw();

        //temp system.
        //system = this.getEntitiesByType( EntitySystem )[0];

        //initialize system variables.
        sysEngines = this.getEntitiesByType( EntityEngines )[0];
        sysShields = this.getEntitiesByType( EntityShields )[0];
        sysCloaking = this.getEntitiesByType( EntityCloaking )[0];
        sysWeapons = this.getEntitiesByType( EntityWeapons )[0];
        sysLifesupport = this.getEntitiesByType( EntityLifesupport )[0];
        sysSensors = this.getEntitiesByType( EntitySensors )[0];
       
        //set player
        player = this.getEntitiesByType( EntityPlayer )[0];

        //follow camera mode
        if(player) {
            this.screen.x = player.pos.x - ig.system.width/2;
            this.screen.y = player.pos.y - ig.system.height/2;
        }
        
        //draw held-core indicators
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

            //this.myNoteMgr.spawn('media/font.png', 'hello world',  6, (this.font.height*6), ig.Font.ALIGN.LEFT);
            //this.myNoteMgr.draw();

	        this.newEvent = false;

            if(this.eventNum != this.currEvent.numEvents - 1){ //makes sure it does not hop off end of array
                this.eventNum++; //need to check for array out of bounds at the end of the event.
            }
	        
        }

		this.borderFont.draw('Steps: ' + this.eventTime + '/' + this.timeAllocated, 2, (ig.system.height - this.font.height - 1), ig.Font.ALIGN.LEFT);
        this.borderFont.draw('Voyage: ' + this.voyageCounter + '/' + 200, ig.system.width, (ig.system.height - this.font.height - 1), ig.Font.ALIGN.RIGHT);
        //this.borderFont.draw('System: ' + this.primarySystem, 2, 2, ig.Font.ALIGN.LEFT);
        this.borderFont.draw('Captain: \n' + this.currEvent.captiansOrd[this.eventNum -1],  2, 2, ig.Font.ALIGN.LEFT);
        
        
        if(player.hasMoved){

            this.checkingEv(); //iterates event time and applicable heat counters, handles win conditions
            

            //this checks for the win condition gameover screen should be in the else satement. 
            if(this.gameStatus == 1 || this.voyageCounter > 200){
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
                if(this.primarySystem == 'Engines'){
                    sysEngines.isPrimary = true;
                    system = sysEngines;
                    console.log("Eng. is primary.");

                }else if(this.primarySystem == 'Shields'){
                    sysShields.isPrimary = true;
                    system = sysShields;
                    console.log("sheild is primary.");

                }else if(this.primarySystem == 'Cloaking'){
                    sysCloaking.isPrimary = true;
                    system = sysCloaking;
                    console.log("cloak is primary.");

                }else if(this.primarySystem == 'Weapons'){
                    sysWeapons.isPrimary = true;
                    system = sysWeapons;
                    console.log("wep. is primary.");

                }else if(this.primarySystem == 'Lifesupport'){
                    sysLifesupport.isPrimary = true;
                    system = sysLifesupport;
                    console.log("LS is primary.");

                }else if(this.primarySystem == 'Sensors'){
                    sysSensors.isPrimary = true;
                    system = sysSensors;
                    console.log("sensors is primary.");

                }else{
                    console.log("no primary system found.");
                }



                //this.eventTime = 0; //resets the time for the event

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
    font: new ig.Font('media/font.png', {fontColor: '#0B0B3B'}),
    background: new ig.Image('media/art/mainbg.png'),
    title: new ig.Image('media/art/mainoverlay.png'),

    init: function() {
        ig.input.bind(ig.KEY.SPACE, 'start');
        ig.input.bind(ig.KEY.I, 'instruct');
        ig.input.bind(ig.KEY.C, 'credits');
        //ig.input.bind(ig.KEY.W, 'gamewin');
        //ig.input.bind(ig.KEY.G, 'gameover');
    },

    update: function() {
        if(ig.input.pressed('start')) ig.system.setGame(EDeck)
        if(ig.input.pressed('instruct')) ig.system.setGame(InstructionScreen)
        if(ig.input.pressed('credits')) ig.system.setGame(CreditScreen)
        //if(ig.input.pressed('gamewin')) ig.system.setGame(GameWinScreen)
        //if(ig.input.pressed('gameover')) ig.system.setGame(GameOverScreen)
        this.parent();
    },

    draw: function() {
        this.parent();
        this.background.draw(0,0);
        this.title.draw(0,0);
        var x = 4;
        var y = 50;
        this.font.draw('START GAME       [#FF0000 <SPACE>] \n \n' +
					   'INSTRUCTIONS         [#FF0000 <I>] \n \n' +
        			   'CREDITS              [#FF0000 <C>] ', x, y);
        //this.font.draw('[#5F04B4 <W>] Debug Game Win', x, y + this.font.height*4 + 9);
        //this.font.draw('[#5F04B4 <G>] Debug Game Over', x, y + this.font.height*5 + 12);
    }
});

InstructionScreen = ig.Game.extend({
    font: new ig.Font('media/font.png', {fontColor: '#0B0B3B'}),
    infos: new ig.Image('media/art/infoScreen.png'),
	background: new ig.Image('media/art/mainbg.png'),

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
        this.infos.draw(ig.system.width/2 - (this.infos.width/2), 0);
        var x = 49;
        var y = 50;
        var fh = this.font.height;
        this.font.draw('USE [#FF0000 WASD] OR [#FF0000 ARROWS] TO MOVE. \n \n' +
        			   'PRESS [#FF0000 SPACE] OR [#FF0000 E] TO PICK UP \n' +
        			   'CORES AND ACTIVATE SYSTEMS. \n \n' + 
        			   'PRESS [#FF0000 F] TO DROP A HELD CORE.', x, y);
        this.font.draw('MENU                    [#FF0000 <ESC>]', x, ig.system.height - 29);
    }
});

/*- 
- Use the Space Bar or E to pick up a Core or interact with the ship's systems.
- Pressing F drops a held core on the ground.
- To mute the game, press M*/

CreditScreen = ig.Game.extend({
    font: new ig.Font('media/font.png', {fontColor: '#0B0B3B'}),
    borderFont: new ig.Font('media/font.png', {fontColor: '#01DF3A', borderColor: '#000'}),
    credits: new ig.Image('media/art/creditScreen.png'),
    background: new ig.Image('media/art/mainbg.png'),

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
        this.credits.draw(ig.system.width/2 - (this.credits.width/2), 0);
        var x = 49;
        var bx = ig.system.width/2 + this.credits.width/2 - 7;
        var y = 50;
        var fh = this.font.height;
        this.font.draw('CODE/LEVEL DESIGN:', x, y);
        this.borderFont.draw('Kevin McCotter', bx, y + fh+2, ig.Font.ALIGN.RIGHT);
        this.font.draw('CODE/MISSION DESIGN:', x, y + fh*3);
        this.borderFont.draw('Andrew Miller', bx, y + fh*4+2, ig.Font.ALIGN.RIGHT);
        this.font.draw('SOUND DESIGN:', x, y + fh*6);
        this.borderFont.draw('Robert Ho', bx, y + fh*7+2, ig.Font.ALIGN.RIGHT);
        this.font.draw('GRAPHICAL DESIGN:', x, y + fh*9);
        this.borderFont.draw('Martina Stepisnik', bx, y + fh*10+2, ig.Font.ALIGN.RIGHT);
		this.font.draw('MENU                    [#FF0000 <ESC>]', x, ig.system.height - 30);
    }
});

GameWinScreen = ig.Game.extend({
    font: new ig.Font('media/font.png', {fontColor: '#FFF'}),
    //gameOver: new ig.Image('media/art/gameoversmall.png'),
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
        //this.gameOver.draw(x - (this.gameOver.width/2), this.gameOver.height/2 - 50);
        this.font.draw('[#FF0000 <ESC>] MENU', x, ig.system.height - this.font.height, ig.Font.ALIGN.CENTER);

    }
});

GameOverScreen = ig.Game.extend({
    font: new ig.Font('media/font.png', {fontColor: '#FFF'}),
    //gameOver: new ig.Image('media/art/gameoversmall.png'),
    background: new ig.Image('media/art/loser.png'),
    

    init: function() {
        ig.input.bind(ig.KEY.SPACE, 'restart');
        ig.input.bind(ig.KEY.ESC, 'menu');
        var explosion = new ig.Sound('media/audio/explosion.*',false);
        explosion.play();
        ig.music.stop();
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
        //this.gameOver.draw(x - (this.gameOver.width/2), this.gameOver.height/2 - 50);
        this.font.draw('[#FF0000 <SPACE>] RESTART', x, ig.system.height - (this.font.height*2), ig.Font.ALIGN.CENTER);
        this.font.draw('[#FF0000 <ESC>] MENU', x, ig.system.height - this.font.height, ig.Font.ALIGN.CENTER);

    }
});

ig.main( '#canvas', MenuScreen, 60, 300, 220, 2 );

});
