// Identify this scene
thisIndex = 0;


// Camera Positioning
sceneManager[thisIndex].camera.position.set(0, 60, 75);
sceneManager[thisIndex].camera.lookAt(new THREE.Vector3(0, 0, 0));


// Set up room dimensions
var roomHeight = 150,
	roomWidth = 275,
	roomLength = 400,
	wallThickness = 2,
	cornerWidth = roomWidth/8;


// Setup Lighting
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
	sceneManager[thisIndex].scene.add(sl);
});


// Setup Materials & Textures
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

// Add all enviornment objects to scene
for (var key in components) {
	// hasOwnProperty needed to prevent insert keys into the prototype object of dictionary
	if (components.hasOwnProperty(key)) {
		var newObject = new THREE.Mesh(components[key][0], components[key][1]);
		newObject.position.set(components[key][2], components[key][3], components[key][4]);
		newObject.name = key;

		assignChildrenName(newObject, key, newObject.position);
		sceneManager[thisIndex].scene.add(newObject);
		sceneManager[thisIndex].sceneObjects.push(newObject);
	}
}


// Object dimensions
var tblScale = 0.35,
	lockerScale = 0.70;

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

// Add all objs to the scene
addObjects(lo, thisIndex);


// Marker to move into different worlds
var marker = new THREE.Mesh(new THREE.SphereGeometry(10, 8, 8), new THREE.MeshNormalMaterial());
marker.overdraw = true;
marker.position.set(-120, 50, 0);
marker.name = "marker";
assignChildrenName(marker, "marker", marker.position);
sceneManager[thisIndex].transport = [0, 60, 100];
sceneManager[thisIndex].scene.add(marker);
sceneManager[thisIndex].sceneObjects.push(marker); 

