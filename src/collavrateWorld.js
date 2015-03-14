var clock = new THREE.Clock();

/* Setup three.js WebGL renderer */
var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setClearColor(new THREE.Color(0x000, 1.0));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMapEnabled = true;


/* Append the canvas element created by the renderer to document body element. */
document.body.appendChild( renderer.domElement );


/* Create a three.js scene */
var scene = new THREE.Scene();


/* Create a three.js camera */
var camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
// Position and point the camera to the center of the scene
camera.position.set(0, 70, 75);
//camera.rotate.y = 90 * Math.PI / 180;
camera.lookAt(new THREE.Vector3(0, 0, 0));


/* Apply VR headset positional data to camera. */
var controls = new THREE.VRControls( camera );


/* Apply VR stereo rendering to renderer */
var effect = new THREE.VREffect( renderer );
effect.setSize( window.innerWidth, window.innerHeight );


/* Raycaster */
var raycaster = new THREE.Raycaster();

var isDrawingEnabled = false;

/* Apply first person controls to the camera */
var camControls = new THREE.FirstPersonControls(camera);
camControls.lookSpeed = 0.4;
camControls.movementSpeed = 20;
camControls.noFly = true;
camControls.lookVertical = true;
camControls.constrainVertical = true;
camControls.verticalMin = 1.0;
camControls.verticalMax = 2.0;
camControls.lon = -150;
camControls.lat = 120;


// 3D area dimension variables
var roomHeight = 150;
var roomWidth = 275;
var roomLength = 275;
var wallThickness = 2;
var cornerWidth = roomWidth/8;

/* Lighting */

var spotLights = [ 	[ roomWidth*0.8, roomHeight, roomLength/2*0.8, 1 ], 
					[ -roomWidth*0.8, roomHeight, roomLength/2*0.8, 1 ], 
					[ roomWidth*0.8, roomHeight, -roomLength/2*0.8, 1 ], 
					[ -roomWidth*0.8, roomHeight, -roomLength/2*0.8, 1 ]
					[ 0, 0, 0, 1 ] 
				];

spotLights.forEach(function(light) {
    var sl = new THREE.SpotLight(0xffffff);
    sl.position.set(light[0], light[1], light[2]);
	sl.intensity = light[3];
	scene.add(sl);
});

// var ambientLight = new THREE.AmbientLight(0x383838);
// scene.add(ambientLight);


// Add axis (Dev Only)
// scene.add(new THREE.AxisHelper(150));


/* Create 3d objects */

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

// Materials & Texture
var floorTexture = THREE.ImageUtils.loadTexture( "images/tile.jpg" );
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set( 5, 5 );

var ceilTexture = THREE.ImageUtils.loadTexture( "images/ceil3.jpg" );
ceilTexture.wrapS = ceilTexture.wrapT = THREE.RepeatWrapping;
ceilTexture.repeat.set( 3, 10 );

var matWall = new THREE.MeshPhongMaterial({color: 0xffffff});
var matFloor = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
var matCeiling = new THREE.MeshBasicMaterial( { map: ceilTexture, side: THREE.DoubleSide } );

// Geometries
var geoFaceWall = new THREE.BoxGeometry(roomWidth, roomHeight, wallThickness);
var geoSideWall = new THREE.BoxGeometry(wallThickness, roomHeight, roomLength);
var geoFloor = new THREE.BoxGeometry(roomWidth, wallThickness, roomLength);
var geoCorner = new THREE.BoxGeometry(cornerWidth, roomHeight, cornerWidth);
var geoWallExt = new THREE.BoxGeometry(roomWidth/30, roomHeight, roomLength*0.4);

// Environment Objects 	< name : [ geometry, material, Px, Py, Pz ] >
var components = { 
	wallS : 		[ geoFaceWall, matWall, 0, roomHeight/2, -roomLength/2 - wallThickness/2 ], 
	wallE : 		[ geoSideWall, matWall, -roomWidth/2 - wallThickness/2, roomHeight/2, 0 ],
	wallW : 		[ geoSideWall, matWall, roomWidth/2 + wallThickness/2, roomHeight/2, 0 ],
	wallN : 		[ geoFaceWall, matWall, 0, roomHeight/2, roomLength/2 + wallThickness/2 ],
	floor : 		[ geoFloor, matFloor,	0, wallThickness/2, 0 ],
	celing : 		[ geoFloor, matCeiling,	0, roomHeight + wallThickness/2, 0 ],
	cornerBlock : 	[ geoCorner, matWall,	-roomWidth/2 + cornerWidth/2, roomHeight/2, -roomLength/2 + cornerWidth/2 ],
	wallExt : 		[ geoWallExt, matWall,	-roomWidth/2 + roomWidth/30/2, roomHeight/2, roomLength/2 - (roomLength*0.4)/2 ],
};

for (var key in components) {
	// hasOwnProperty needed to prevent insert keys into the prototype object of dictionary
	if (components.hasOwnProperty(key)) {
		var newObject = new THREE.Mesh(components[key][0], components[key][1]);
		newObject.position.set(components[key][2], components[key][3], components[key][4]);
		newObject.name = key;

		assignChildrenName(newObject, key, newObject.position);
		scene.add(newObject);
	}
}

// Loader to load .obj and .mtl
var loader = new THREE.OBJMTLLoader();

// Object vars
var tblScale = 0.35;
var lockerScale = 0.70;

// Load Objects 	< name : [ filename, Sx, Sy, Sz, Px, Py, Pz, Rx, Ry, Rz ] >
var lo = { 
	'table1' : [ 'models/technicalTable1', tblScale, tblScale, tblScale, roomWidth/2 - 50, 36, - roomLength/2 + 25, null, null, null ],
	'table2' : [ 'models/technicalTable1', tblScale, tblScale, tblScale, -roomWidth/2 + 100, 36, - roomLength/2 + 25, null, null, null ],
	'table3' : [ 'models/technicalTable1', tblScale, tblScale, tblScale, -roomWidth/2 + 80, 36, 50, null, null, null ],
	'table4' : [ 'models/technicalTable1', tblScale, tblScale, tblScale, roomWidth/2 - 50, 36, 50, null, null, null ],
	'lockers1' : [ 'models/lockers', lockerScale, lockerScale, lockerScale, roomWidth/2 - 5, 5, -30, null, 3*Math.PI/2, null ],
	'lockers2' : [ 'models/lockers', lockerScale, lockerScale, lockerScale, roomWidth/2 - 5, 37, -30, null, 3*Math.PI/2, null ],
	'whiteBoard1' : [ 'models/whiteBoard', 0.40, 0.80, 0.60, 0, 0, roomLength/2 - 15, null, null, null ],
	'whiteBoard2' : [ 'models/whiteBoard', 0.40, 0.80, 0.60, -80, 0, roomLength/2 - 15, null, null, null ]
};

var addObjects = function(lo) {
	for (var key in lo) {
		loader.load( lo[key][0] + '.obj', lo[key][0] + '.mtl', function ( obj ) { 
			obj.scale.set(lo[this.key][1], lo[this.key][2], lo[this.key][3]);
			obj.position.set(lo[this.key][4], lo[this.key][5], lo[this.key][6]);
			
			if (lo[this.key][7]) obj.rotation.x = lo[this.key][7];
			if (lo[this.key][8]) obj.rotation.y = lo[this.key][8];
			if (lo[this.key][9]) obj.rotation.z = lo[this.key][9];


			obj.name = this.key;
			assignChildrenName(obj, this.key, obj.position);
			scene.add(obj); 

		}.bind({key: key}));
		
	}
};
addObjects(lo)

function distance(v1, v2) {
	if (v1 && v2) {
		dx = v1.x - v2.x;
	    // dy = v1.y - v2.y;
	    dz = v1.z - v2.z;

	    return Math.sqrt(dx*dx+dz*dz);
	}
	return 100;
}


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
		var intersects = ray.intersectObjects( scene.children, true ); 

		for (z = 0; z < intersects.length; z++) {
			if (intersects[z].object.position.x === 0, 
				intersects[z].object.position.y === 0,
				intersects[z].object.position.z === 0) {
				var dist = distance(camera.position, intersects[z].object.positionRelative);
			} else {
				var dist = distance(camera.position, intersects[z].object.position);
			};
			

    		if ((dist < 30) && intersects[z].object.name !== "floor" && intersects[z].object.name != "hand") {	
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


/* Request animation frame loop function */
function render() {
	var delta = clock.getDelta();

	// camControls.moveForward = checkBoundaries();
	// if (checkBoundaries()) {
		camControls.update(delta);
	// } else {
	// 	// we know we're close to an object
	// 	var fullname = document.getElementById("info").innerHTML;
	// 	name = fullname.substring(0, fullname.length - 1);

	// 	if (window.myoManager) {
	// 		if (document.getElementById("info").innerHTML == fullname && !isDrawingEnabled) {
	// 			isDrawingEnabled = true;
	// 			window.myoManager.toggleVisibility(true);

	// 			// get which whiteboard we're looking at
	// 			var whiteboard = scene.getObjectByName(fullname);

	// 			window.myoManager.setHandPosition(whiteboard.position, whiteboard);
	// 		} else if (document.getElementById("info").innerHTML != fullname) {
	// 			isDrawingEnabled = false;
	// 		}
	// 	}
	// }
	
	/*
	Update VR headset position and apply to camera.
	*/
	controls.update();

	/*
	Render the scene through the VREffect.
	*/
	//effect.render( scene, camera );

	// Render without stero VR effect
	renderer.render(scene, camera);

	requestAnimationFrame( render );
}


/* Kick off animation loop */
render();

/* Listen for double click event to enter full-screen VR mode */
document.body.addEventListener( 'dblclick', function() {
	effect.setFullScreen( true );
});


/* Listen for keyboard event and zero positional sensor on appropriate keypress. */
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


/* Handle window resizes */
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	effect.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener( 'resize', onWindowResize, false );