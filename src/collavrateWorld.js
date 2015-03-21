var clock = new THREE.Clock();

/* ---- Setup three.js WebGL renderer -------------------------------------- */

var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setClearColor(new THREE.Color(0x000, 1.0));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMapEnabled = true;

// Append the canvas element created by the renderer to document body element
document.body.appendChild( renderer.domElement );


/* ---- Set and manage scenes ---------------------------------------------- */

// For each scene, create three.js scene and three.js camera
var sceneManager = 	[	
						{ 	scene: new THREE.Scene(), 
							camera: new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 ),
							sceneObjects: [],
							transport: []
						},
						{ 	scene: new THREE.Scene(), 
							camera: new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ), 
							sceneObjects: [],
							transport: []
						}
					];

// Set current scene and camera to first by default
var sceneIndex = 0;
var scene = sceneManager[sceneIndex].scene,
	camera = sceneManager[sceneIndex].camera;


/* ---- Setup for virtual reality ------------------------------------------ */

// Apply VR headset positional data to camera.
var controls = new THREE.VRControls( camera );

// Apply VR stereo rendering to renderer
var effect = new THREE.VREffect( renderer );
effect.setSize( window.innerWidth, window.innerHeight );


/* ---- Apply first person controls to the camera -------------------------- */

var camControls = new THREE.FirstPersonControls(camera);
camControls.lookSpeed = 0.4;
camControls.movementSpeed = 30;
camControls.noFly = true;
camControls.lookVertical = true;
camControls.constrainVertical = true;
camControls.verticalMin = 1.0;
camControls.verticalMax = 2.0;
camControls.lon = -150;
camControls.lat = 120;


/* ---- Scene Switching ---------------------------------------------------- */

var toggleScene = false;

// Switch to the next available world/scene
var switchScenes = function() {

	// Get next scene. If we're one the last one, get the first scene.
	sceneIndex++;
	if (sceneIndex >= sceneManager.length) {
		sceneIndex = 0;
	}

	scene = sceneManager[sceneIndex].scene;
	camera = sceneManager[sceneIndex].camera;

	// After scene switching, position camera to avoid automatic collision
	//	with markers
	tCoords = sceneManager[sceneIndex].transport;
	camera.position.set(tCoords[0], tCoords[1], tCoords[2]);

	if (sceneIndex == 1) {
		video.play();
	} else { // Pause and reset
		video.pause();
		video.load();
	}

	camControls.object = camera;
	controls = new THREE.VRControls( camera );
};


/* ---- Scene Components ------------------------------------------------------ */

// Add axis (Dev Only)
// scene.add(new THREE.AxisHelper(150));

// Loader to load .obj and .mtl
var loader = new THREE.OBJMTLLoader();

// Given a dictionary of objects and properties, use loader to load the obl and mtl
//	files and apply the appropriate attributes (i.e. scaling/postioning/rotation)
var addObjects = function(lo, sIndex) {
	for (var key in lo) {
		loader.load( lo[key][0] + '.obj', lo[key][0] + '.mtl', function ( obj ) { 
			obj.scale.set(lo[this.key][1], lo[this.key][2], lo[this.key][3]);
			obj.position.set(lo[this.key][4], lo[this.key][5], lo[this.key][6]);
			
			if (lo[this.key][7]) obj.rotation.x = lo[this.key][7];
			if (lo[this.key][8]) obj.rotation.y = lo[this.key][8];
			if (lo[this.key][9]) obj.rotation.z = lo[this.key][9];


			obj.name = this.key;
			assignChildrenName(obj, this.key, obj.position);
			sceneManager[sIndex].scene.add(obj);
			sceneManager[sIndex].sceneObjects.push(obj);

		}.bind({key: key}));
		
	}
};

// Set for video
var video, videoImage, videoImageContext, videoTexture;


/* ---- Collision Detection ------------------------------------------------ */

var raycaster = new THREE.Raycaster();

function distance(v1, v2) {
	if (v1 && v2) {
		dx = v1.x - v2.x;
	    // dy = v1.y - v2.y;
	    dz = v1.z - v2.z;

	    return Math.sqrt(dx*dx+dz*dz);
	}
	return 100;
}

var assignChildrenName = function(obj, name, position) {

	if (obj.type == "Mesh") {
		// we just need to change this.. 
		obj.name = name;
		obj.positionRelative = position;
		return;
	}

	if (obj.children) {
		for (objIndex = 0; objIndex < obj.children.length; objIndex++) {
			// this will be the object3d
			obj3d = obj.children[objIndex];
			assignChildrenName(obj3d, name, position);
		}
	}
};

function checkBoundaries() {
	var plocal = new THREE.Vector3(0, 0, -1);
	var pWorld = plocal.applyMatrix4( camera.matrixWorld );
	var vec = pWorld.sub(camera.position).normalize();

	var pos = camera.position;

	var rays = [
		new THREE.Vector3(pos.x, pos.y - 30, pos.z),
		new THREE.Vector3(pos.x, pos.y, pos.z),
		new THREE.Vector3(pos.x, pos.y + 20, pos.z)
	];

	for (r = 0; r < rays.length; r++) {
		var ray = new THREE.Raycaster(rays[r], vec);
		var intersects = ray.intersectObjects( sceneManager[sceneIndex].sceneObjects, true ); 

		for (z = 0; z < intersects.length; z++) {
			if (intersects[z].object.position.x === 0, 
				intersects[z].object.position.y === 0,
				intersects[z].object.position.z === 0) {
				var dist = distance(camera.position, intersects[z].object.positionRelative);
			} else {
				var dist = distance(camera.position, intersects[z].object.position);
			};

    		if ( (dist < 30) 
    			&& intersects[z].object.name !== "floor" 
    			&& intersects[z].object.name != "hand" 
    			&& intersects[z].object.name != "celing" ) {

    			document.getElementById("info").style.display = "block";
    			document.getElementById("info").innerHTML = intersects[z].object.name;

    			return false;
    		}
    	}
	} 

	document.getElementById("info").style.display = "none";
	document.getElementById("info").innerHTML = "";
	return true;       	
}


/* ---- Render the scene --------------------------------------------------- */

var isDrawingEnabled = false;

/* Request animation frame loop function */
function render() {

	if (video) {
		if ( video.readyState === video.HAVE_ENOUGH_DATA ) 
		{
			videoImageContext.drawImage( video, 0, 0 );
			if ( videoTexture ) 
				videoTexture.needsUpdate = true;
		}
	}

	var delta = clock.getDelta();

	// camControls.moveForward = checkBoundaries();
	if ( checkBoundaries() ) {
		camControls.update(delta);
	
	} else {
		
		// We know we're close to an object
		var fullname = document.getElementById("info").innerHTML;
		name = fullname.substring(0, fullname.length - 1);

		if (window.myoManager) {
			if (document.getElementById("info").innerHTML == "marker") {
				
				// Move to new world...
				window.addEventListener("keydown", checkSceneSwitch, true);
				if (toggleScene) {
					toggleScene = false;
					switchScenes();
				}

			} else if (document.getElementById("info").innerHTML == fullname && !isDrawingEnabled) {
				isDrawingEnabled = true;
				window.myoManager.toggleVisibility(true);

				// get which whiteboard we're looking at
				var whiteboard = scene.getObjectByName(fullname);

				window.myoManager.setHandPosition(whiteboard.position, whiteboard);

			} else if (document.getElementById("info").innerHTML != fullname) {
				isDrawingEnabled = false;
			}
		}
	}
	
	// Update VR headset position and apply to camera.
	controls.update();

	// Render the scene through the VREffect
	// effect.render( scene, camera );

	// Render the scene normally without stero VR effect
	renderer.render(scene, camera);

	requestAnimationFrame( render );
}

// Kick off animation loop
render();


/* ---- Event Listeners ---------------------------------------------------- */

// Listen for double click to enter full-screen VR mode
document.body.addEventListener( 'dblclick', function() {
	effect.setFullScreen( true );
});

// Listen for keyboard event and zero positional sensor on appropriate keypress
function onkey(event) {
	event.preventDefault();

	if (event.keyCode == 90) { // z
		controls.zeroSensor();

	} else if (event.keyCode == 80) { // p (pause)

		// Toggle camera look speed on/off
		(camControls.lookSpeed > 0.0) ? camControls.lookSpeed = 0.0 : camControls.lookSpeed = 0.4;	
	}
};

window.addEventListener("keydown", onkey, true);

function checkSceneSwitch(event) {
	event.preventDefault();
	if (event.keyCode == 79) { // o
		toggleScene = true;
	}

	window.removeEventListener("keydown", checkSceneSwitch, true);
};

// Handle window resizes
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	effect.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener( 'resize', onWindowResize, false );