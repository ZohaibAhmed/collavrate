// Identify this scene
thisIndex = 2;

var currentLine = null;
var currentVertices = [];

// Camera Positioning
sceneManager[thisIndex].camera.position.set(0, 0, 25);
sceneManager[thisIndex].camera.lookAt(new THREE.Vector3(0, 0, -10));

var geometry = new THREE.BoxGeometry( 2, 2, 2 );
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var cursor = new THREE.Mesh( geometry, material );

cursor.position.set(0, 0, -10);
scene.add( cursor );

var old_x = 0,
	old_y = 0;

// Setup Lighting
var ambientLight = new THREE.AmbientLight(0x383838);
sceneManager[thisIndex].scene.add(ambientLight);

var spotLight1 = new THREE.SpotLight(0xffffff);
var spotLight2 = new THREE.SpotLight(0xffffff);
spotLight1.position.set(0, roomLength*0.25, -roomLength/2 * 0.95);
spotLight2.position.set(0, roomLength*0.75, -roomLength/2 * 0.95);
spotLight1.intensity = 0.5;
spotLight2.intensity = 0.5;
sceneManager[thisIndex].scene.add(spotLight1);
sceneManager[thisIndex].scene.add(spotLight2);

var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
directionalLight.position.set( 0, 1, 0 );
sceneManager[thisIndex].scene.add( directionalLight );


// Add marker to move into different worlds
var markerTheatre = new THREE.Mesh(new THREE.SphereGeometry(10, 8, 8), new THREE.MeshNormalMaterial());
markerTheatre.overdraw = true;
markerTheatre.position.set(0, 50, 150);
markerTheatre.name = "marker";
assignChildrenName(markerTheatre, "marker", markerTheatre.position);
sceneManager[thisIndex].transport = [0, 60, 0];
sceneManager[thisIndex].scene.add(markerTheatre);
sceneManager[thisIndex].sceneObjects.push(markerTheatre);


function draw() {
	currentLine.geometry.vertices.push(currentLine.geometry.vertices.shift()); //shift the array
    currentLine.geometry.vertices[100000-1] = new THREE.Vector3(cursor.position.x, cursor.position.y, cursor.position.z); //add the point to the end of the array
    currentLine.geometry.verticesNeedUpdate = true;

    currentLine.push(new THREE.Vector2(cursor.position.x, cursor.position.y));
}

function moveCursor(x, y) {
	// console.log("x is " + x);
	// console.log("y is " + y);

	displacement_x = x - old_x;
	displacement_y = y - old_y;

	cursor.translateX(displacement_x);
	cursor.translateY(displacement_y);

	old_x = x;
	old_y = y;
}

function startDraw() {
	var geometry, line, lineMaterial,
	MAX_LINE_POINTS = 100000;

	lineMaterial = new THREE.MeshBasicMaterial({
	    color: 0xffffff
	});

	geometry = new THREE.Geometry();
	for (i=0; i<MAX_LINE_POINTS; i++){
	    
        geometry.vertices.push(new THREE.Vector3(cursor.position.x, cursor.position.y, cursor.position.z));
	    
	}

	line = new THREE.Line(geometry, lineMaterial);
	line.geometry.dynamic = true;
	line.name = "myline";

	currentLine = line;
	sceneManager[thisIndex].scene.add(line);
}
