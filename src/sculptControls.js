var toolbelt = {
	toolGroup: null,
	totalRotation: 0, // when we rotate, move this value up
	singleRotation: 0,
	direction: null,
	ROTATEFLAG: false,
	toolsList: [],
	currentIndex: 0,
	events: [],
	enabled: false,

	rotate: function(speed) {
		if (this.ROTATEFLAG) {
			if (this.direction == "right") {
				if (this.toolGroup.rotation.y <= this.totalRotation + this.singleRotation) {
					this.toolGroup.rotation.y += speed;
				} else {
					// Rotate the remaining amount left, to fix speed value innacuracy 
					this.toolGroup.rotation.y = this.totalRotation + this.singleRotation
					this.stopRotate();
				}
			} else {
				if (this.toolGroup.rotation.y >= this.totalRotation - this.singleRotation) {
					this.toolGroup.rotation.y -= speed;
				} else {
					// Rotate the remaining amount left, to fix speed value innacuracy
					this.toolGroup.rotation.y = this.totalRotation - this.singleRotation
					this.stopRotate();
				}
			}
		}
	},

	stopRotate: function() {
		this.totalRotation = 0;
		this.ROTATEFLAG = false;
		this.totalRotation = this.toolGroup.rotation.y;

		this.setCurrentToActive();
		this.trigger('change', [this.getCurrentToolName()]);
	},

	setCurrentToActive: function() {
		var obj = this.toolsList[this.currentIndex];

		var objLeft = (this.currentIndex - 1) < 0 ? this.toolsList.length - 1 : this.currentIndex - 1;
		var objRight = (this.currentIndex + 1) >= this.toolsList.length ? 0 : this.currentIndex + 1;

		this.toolsList[objLeft].material.opacity = 0.7;
		this.toolsList[objRight].material.opacity = 0.7;

		obj.material.opacity = 1;
		console.log(this.getCurrentToolName());
	},

	startRotate: function(direction) {
		this.ROTATEFLAG = true;
		this.direction = direction;

		if (direction == "left") {
			if (this.currentIndex + 1 >= this.toolsList.length) {
				this.currentIndex = 0;
			} else {
				this.currentIndex++;
			}
		} else {
			if (this.currentIndex - 1 < 0) {
				this.currentIndex = this.toolsList.length - 1;
			} else {
				this.currentIndex--;
			}
		}
	},

	getCurrentToolName: function() {
		if (this.toolsList[this.currentIndex]) {
			return this.toolsList[this.currentIndex].name;
		} else {
			return null;
		}
	},

	addTools: function(sIndex, x, y, z) {

		var opacity = 0.7,
			toolColours = [0xfae157, 0xFF9933, 0x33CC33, 0x000099, 0xFF0000, 0x99CCFF, 0x33FF22, 0xEAEAEA];
			toolImages = ['images/icons/icon-move.png', 'images/icons/icon-extrude.png', 
							'images/icons/icon-subtract.png', 'images/icons/icon-union.png', 
							'images/icons/icon-intersect.png', 'images/icons/icon-skew.png',
							'images/icons/icon-export.png', 'images/icons/icon-empty.png' ];

		var geoTools = new THREE.BoxGeometry(12, 12, 2);

		// For each colour, use to create a new Mesh Lambert Material	
		var matTools = [];
		for (i = 0; i < toolColours.length; i++) { 
		    matTools.push(new THREE.MeshLambertMaterial({opacity: opacity, transparent: true, map: THREE.ImageUtils.loadTexture(toolImages[i])}));
		}

		// tools
		var tools = [ 	{ name: 'Move', 	material: matTools[0], px: 0, py: y, pz: 20 }, 
						{ name: 'Extrude', 	material: matTools[1], px: 15, py: y, pz: 15 }, 
						{ name: 'Subtract', 	material: matTools[2], px: 20, py: y, pz: 0 }, 
						{ name: 'Union', 	material: matTools[3], px: 15, py: y, pz: -15 }, 
						{ name: 'Intersect', 	material: matTools[4], px: 0, py: y, pz: -20 },
						{ name: 'Skew Z', 	material: matTools[5], px: -15, py: y, pz: -15 },
						{ name: 'Export', 	material: matTools[6], px: -20, py: y, pz: 0 }, 
						{ name: 'Nothing', 	material: matTools[7], px: -15, py: y, pz: 15 } 
					];

		this.singleRotation = Math.PI/(tools.length/2);

		this.toolGroup = new THREE.Object3D();

		var rotation = 0;
		for (toolsIndex = 0; toolsIndex < tools.length; toolsIndex++) {

		    var newObject = new THREE.Mesh(geoTools, tools[toolsIndex].material);
			newObject.position.set(tools[toolsIndex].px, tools[toolsIndex].py, tools[toolsIndex].pz);
			newObject.rotation.y = rotation;

			newObject.name = tools[toolsIndex].name;

			assignChildrenName(newObject, tools[toolsIndex].name, newObject.position);
			
			this.toolGroup.add( newObject );
			this.toolsList.push(newObject);

			//new Label(newObject, sceneManager[sIndex].camera, "test");			

			rotation += Math.PI/4;
		}

		this.toolsList[0].material.opacity = 1;

		this.toolGroup.name = "toolGroup";
		sceneManager[sIndex].scene.add(this.toolGroup);
		this.enabled = true;
	},

	removeTools: function(sIndex) {
		sceneManager[sIndex].scene.remove(this.toolGroup);
		this.enabled = false;
		this.toolsList = [];
		this.toolGroup = null;
		this.totalRotation = 0;
		this.singleRotation = 0;
		
	},

	on: function(eventName, fn) {
		this.events.push({"name": eventName, "fn": fn})
	},

	trigger: function(eventName, args){
		this.events.map(function(event){
			if(event.name == eventName) event.fn.apply(self, args);
		});
	}
}















