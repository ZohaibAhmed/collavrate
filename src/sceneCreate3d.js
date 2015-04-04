// Identify this scene
thisIndex = 2;

var currentLine = null;
var currentVertices = [];
var meshes = [];
var shapes = [];
var start_y, start_x, start_z, extrude_amount, extrude, extrude_shape, extrude_y;
var cursor;

extrude_amount = 0; // start with 0

// Camera Positioning
sceneManager[thisIndex].camera.position.set(0, 0, 25);
sceneManager[thisIndex].camera.lookAt(new THREE.Vector3(0, 0, -10));

var old_x = 0,
	old_y = 0;

// add subtle blue ambient lighting
var ambientLight = new THREE.AmbientLight(0x000044);
sceneManager[thisIndex].scene.add(ambientLight);

// directional lighting
var directionalLight = new THREE.DirectionalLight(0xffffff);
directionalLight.position.set(1, 1, 1).normalize();
sceneManager[thisIndex].scene.add(directionalLight);

// Adding Axis Helper
sceneManager[thisIndex].scene.add(new THREE.AxisHelper(150));

// Add marker to move into different worlds
var markerTheatre = new THREE.Mesh(new THREE.SphereGeometry(10, 8, 8), new THREE.MeshNormalMaterial());
markerTheatre.overdraw = true;
markerTheatre.position.set(0, 50, 150);
markerTheatre.name = "marker";
assignChildrenName(markerTheatre, "marker", markerTheatre.position);
sceneManager[thisIndex].transport = [0, 0, 25];
sceneManager[thisIndex].scene.add(markerTheatre);
sceneManager[thisIndex].sceneObjects.push(markerTheatre);

function drawLine() {
	currentLine.geometry.vertices.push(currentLine.geometry.vertices.shift()); //shift the array
    currentLine.geometry.vertices[100000-1] = new THREE.Vector3(cursor.position.x, cursor.position.y, cursor.position.z); //add the point to the end of the array
    currentLine.geometry.verticesNeedUpdate = true;

    currentVertices.push(new THREE.Vector2(cursor.position.x, cursor.position.y));
}

function moveCursor(x, y) {
	displacement_x = x - old_x;
	displacement_y = y - old_y;

	cursor.translateX(displacement_x);
	cursor.translateZ(displacement_y);

	if (extrude) {
		// we want to extrude the current shape
		var total_distance = Math.abs(extrude_y - cursor.position.y);
		extrude_amount = Math.ceil(total_distance);

		console.log("extruding amount " + extrude_amount);
		if (extrude_amount > 0) {
			extrudeShape();
		}
	}

	old_x = x;
	old_y = y;
}

function startDraw() {
	currentVertices = [];
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

function finishDraw(vertices) {
	if (vertices) {
		currentVertices = vertices;
	}

	// add the first vertice again
	currentVertices.push(currentVertices[0]);

	// make a shape out of the vertices in currentVertices
	var shape = new THREE.Shape( currentVertices );

	var geometry = new THREE.ShapeGeometry( shape );
	var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: 0xFF00FF, side: THREE.DoubleSide } ) );
	mesh.position.set( currentLine.position.x, currentLine.position.y, cursor.position.z );
	mesh.name = "shape";

	sceneManager[thisIndex].scene.add(mesh);
	meshes.push(mesh);
	shapes.push(shape);
}

function beginExtrude(shape) {
	// listen for mouse move
	extrude = true;
	extrude_shape = shape;
	extrude_y = cursor.position.y;
}

function extrudeShape() {
	var extrudeSettings = { amount: extrude_amount, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };
	
	var geometry = new THREE.ExtrudeGeometry( extrude_shape, extrudeSettings );
	var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: 0xFF00FF } ) );

	mesh.position.set( currentLine.position.x, currentLine.position.y, cursor.position.z );
	
	sceneManager[thisIndex].scene.add( mesh );
}

function endExtrude() {
	extrude = false;
	extrude_shape = null;
	extrude_y = null;
}
