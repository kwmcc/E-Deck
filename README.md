# E-Deck #
As the sole engineer aboard a starship, you are responsible for ensuring that your ship makes it through the perils of deep space in one piece!

At your Captain's orders, you will have to provide power to systems to overcome the obstacles on your journey. Systems will start to overheat when you power the up, and it's your job to find time to cool them down.

If you strategize well, you can keep the ship running smoothly and un-exploded long enough to make it through alive.

### The Goal ###
The Voyage Counter increases for each task completed and essentially denotes the likelihood that the ship will complete its journey. When it reaches its maximum, the ship has cleared all obstacles and you win!

## How To Play ##
- You will need a **keyboard** to play *E-Deck*.
- You can either play the hosted version of the game HERE (TODO: Link)
- Or you can fork, clone, or download a copy of the code and host it on your own webserver.
- *To download this code as a zip, simply click the "Download ZIP" button in the lower righthand corner of this screen!*

### Controls ###
- Use **WASD** or the **Arrow Keys** to move throughout the ship.
- Use the **Space Bar** or **E** to pick up a Core or interact with the ship's systems.
- Pressing **F** drops a held core on the ground.
- To mute the game, press **M**

## Development ##
This game was developed with ImpactJS.

As such, those wishing to Fork this project will require a licensed copy of ImpactJS to effectively develop it as this repository includes none of the licensed Impact core.

### Changes & Issues ###
For those in CMPS 20 wishing to view either a Change Log or Known Issues list, may I redirect you to the github [Issue Tracker](https://github.com/lazrcat0/E-Deck/issues?state=open) for this project (also accessible near the top of the sidebar at right). Items on the list which are still to be fixed are **Open.** Anyone can create new Issues if they find problems and collaborators are automatically notified. **Closed** Issues are ones which have been implemented into the code and checked off. This is effectively our Change Log and you can see a more or less complete history of all the fixes, changes, and additions we have made to the code.

May I take a moment to praise this system, as it greatly enhanced our code pipeline and made organizing everything so much easier.

### Media Sources ###
Background Music: 
- Space Kitten by The Polish Ambassador via Free Music Archive (FMA)

Effects: 
- Explosion: jobro, explosion-5
- Life Support: noisecollector, lifesupport
- Weapons: kantouth, gatling-laser
- Cooling: dj-chronos and kingsamas, clamp and druckablassen-sodaclub
- Shields: bychop, shield-recharging
- Sensors: zarkonnen, sci-fi-sensors
- Engines: insu, plasma-engine-fx
- Pager: timbre, loud-electronic-chirps
- Cloaking: wubitog and robinhood76, soundspacbeamv2-d1-16-14 and 04792-large-object-fat-whoosh
- Core Drop: freemusic(dot)org, user: jarredgibb, metal-ping-3
All effects found on http://freesound.org and are listed by (Effect: username, sound name)

### Code Sources ###
- Grid Based Movement: Joncom, [impact-grid-movement](https://github.com/Joncom/impact-grid-movement)
- Text Formatting: Joncom, [impact-font-sugar](https://github.com/Joncom/impact-font-sugar)
- Notification Manager: quidmonkey, [notification-manager](https://github.com/quidmonkey/NotificationManager-Plugin)
- Heat Bars derived from: Graphikos, [Impact Forum](http://impactjs.com/forums/help/how-to-place-mini-health-bars-on-enemies-level-editor-confusion) 