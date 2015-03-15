/* ---- Camera Positioning ---- */

theatreCamera.position.set(0, 70, 0);
theatreCamera.lookAt(new THREE.Vector3(0, 70, -1));

/* Set up room dimensions */
var roomHeight = 300;
var roomWidth = 600;
var roomLength = 400;
var wallThickness = 2;

/* ---- Lighting ---- */

var ambientLight = new THREE.AmbientLight(0x383838);
theatreScene.add(ambientLight);

// Spotlight for the shadows
var spotLight1 = new THREE.SpotLight(0xffffff);
var spotLight2 = new THREE.SpotLight(0xffffff);
spotLight1.position.set(0, roomLength*0.25, 0);
spotLight2.position.set(0, roomLength*0.75, 0);
spotLight1.intensity = 2;
spotLight2.intensity = 2;
theatreScene.add(spotLight1);
theatreScene.add(spotLight2);


/* ---- Scene elements ---- */

// Materials
var m1 = new THREE.MeshPhongMaterial({color: 0xfae157});
var m2 = new THREE.MeshPhongMaterial({color: 0xd9ff4a});
var m3 = new THREE.MeshPhongMaterial({color: 0x00FFFF});
var m4 = new THREE.MeshPhongMaterial({color: 0xFF9966});

// Geometry
var cube = new THREE.BoxGeometry(1, 1, 1);

// Environment Objects 	< name : [ geometry, material, Sx, Sy, Sz, Px, Py, Pz ] >
var components = { 
	wallS : 		[ cube, m1, roomWidth, roomHeight, wallThickness, 0, roomHeight/2, -roomLength/2 - wallThickness/2 ], 
	wallE : 		[ cube, m2, wallThickness, roomHeight, roomLength, -roomWidth/2 - wallThickness/2, roomHeight/2, 0 ],
	wallW : 		[ cube, m3, wallThickness, roomHeight, roomLength, roomWidth/2 + wallThickness/2, roomHeight/2, 0 ],
	wallN : 		[ cube, m4, roomWidth, roomHeight, wallThickness, 0, roomHeight/2, roomLength/2 + wallThickness/2 ],
	floor : 		[ cube, m1, roomWidth, wallThickness, roomLength, 0, wallThickness/2, 0 ]
};

// Add all enviornment objects to scene
for (var key in components) {
	// hasOwnProperty needed to prevent insert keys into the prototype object of dictionary
	if (components.hasOwnProperty(key)) {
		var newObject = new THREE.Mesh(components[key][0], components[key][1]);
		newObject.scale.set(components[key][2], components[key][3], components[key][4]);
		newObject.position.set(components[key][5], components[key][6], components[key][7]);
		newObject.name = key;
		theatreScene.add(newObject);
	}
}

// Add marker to move into different worlds
var markerTheatre = new THREE.Mesh(new THREE.SphereGeometry(10, 8, 8), new THREE.MeshNormalMaterial());
markerTheatre.overdraw = true;
markerTheatre.position.set(0, 50, roomLength/2*0.90);
markerTheatre.name = "marker";
assignChildrenName(markerTheatre, "marker", markerTheatre.position);
theatreScene.add(markerTheatre);

/* Video */


video = document.createElement( 'video' );
video.src = "videos/sintel.ogv";
video.load(); // must call after setting/changing source
video.play();

videoImage = document.createElement( 'canvas' );
videoImage.width = 480;
videoImage.height = 204;

videoImageContext = videoImage.getContext( '2d' );
// background color if no video present
videoImageContext.fillStyle = '#000000';
videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );
videoTexture = new THREE.Texture( videoImage );
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;

var movieHeight = 100;
var movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true, side:THREE.DoubleSide } );
// the geometry on which the movie will be displayed;
// 		movie image will be scaled to fit these dimensions.
var movieGeometry = new THREE.PlaneGeometry( 240*2, 100*2, 4, 4 );
var movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
movieScreen.position.set(0, roomHeight/2, -roomLength/2 * 0.95);
theatreScene.add(movieScreen);



