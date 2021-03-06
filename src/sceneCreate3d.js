// Identify this scene
thisIndex = 2;

var currentLine = null,
	currentVertices = [],
	meshes = [],
	shapes = [],
	threedmeshes = [],
	selectedObjectVertices = [],
	lastVerticeSelected,
	extrudedMeshes = [],
	MOVE = false,
	COLOURS = [0xFF00FF, 0xfae157, 0xd9ff4a, 0x00FFFF, 0xFF9966];
var start_y, start_x, start_z, extrude_amount, extrude, extrude_shape, extrude_y;
var cursor, cursorClone;

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
	if (cursor) {
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

		if (toolbelt.getCurrentToolName()) {
			if (toolbelt.getCurrentToolName().slice(0, 4) == "Skew") {
				var closest = findClosestVertice();
				closest.material.color.setHex(0xdeca7d); 

				if (closest != lastVerticeSelected && lastVerticeSelected) {
					lastVerticeSelected.material.color.setHex(0x00ff00);
					lastVerticeSelected = closest;
				}
			}
		}

		old_x = x;
		old_y = y;
	}
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
	if (sceneIndex != 2) {
		return;
	}
	if (vertices) {
		currentVertices = vertices;
	}

	// add the first vertice again
	currentVertices.push(currentVertices[0]);

	// make a shape out of the vertices in currentVertices
	var shape = new THREE.Shape( currentVertices );

	var geometry = new THREE.ShapeGeometry( shape );
	var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: COLOURS[Math.floor((Math.random() * COLOURS.length - 1) + 1)], side: THREE.DoubleSide } ) );
	if (currentLine) {
		mesh.position.set( currentLine.position.x, currentLine.position.y, cursor.position.z );
		sceneManager[thisIndex].scene.remove(currentLine);
	} else {
		mesh.position.set( window.myoManager.hands[window.uuid].currentLine.position.x, window.myoManager.hands[window.uuid].currentLine.position.y, cursor.position.z );
		sceneManager[thisIndex].scene.remove(window.myoManager.hands[window.uuid].currentLine);
	}
	mesh.name = "shape";

	sceneManager[thisIndex].scene.add(mesh);
	meshes.push(mesh);
	shapes.push(shape);

	currentVertices = []; // set this to blank
}

function beginExtrude(shape, mesh) {
	if (sceneIndex != 2) {
		return;
	}

	// TEMP solution, remove all the shapes from the scene
	for (meshIndex = 0; meshIndex < meshes.length; meshIndex++) {
		sceneManager[thisIndex].scene.remove(meshes[meshIndex]);
	}

	// remove this shape from scene
	//sceneManager[thisIndex].scene.remove(mesh);

	// listen for mouse move
	extrude = true;
	extrude_shape = shape;
	extrude_y = cursor.position.y;
}

function extrudeShape() {
	if (sceneIndex != 2) {
		return;
	}
	if (extrude_shape) {
		var extrudeSettings = { amount: extrude_amount, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };
		
		var geometry = new THREE.ExtrudeGeometry( extrude_shape, extrudeSettings );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: COLOURS[Math.floor((Math.random() * COLOURS.length - 1) + 1)] } ) );

		if (currentLine) {
			mesh.position.set( currentLine.position.x, currentLine.position.y, cursor.position.z );
		} else {
			mesh.position.set( window.myoManager.hands[window.uuid].currentLine.position.x, window.myoManager.hands[window.uuid].currentLine.position.y, cursor.position.z );
		}
		
		threedmeshes.push(mesh);
		extrudedMeshes.push(mesh);
		sceneManager[thisIndex].scene.add( mesh );

		if (selectedObject) {
			selectedObject["3dmesh"] = mesh;
		}
	}
}

function endExtrude() {
	if (sceneIndex != 2) {
		return;
	}
	// TODO: remove all the extrude shapes except the last.
	for (var k = 0; k < extrudedMeshes.length - 1; k++) {
		sceneManager[thisIndex].scene.remove(extrudedMeshes[k]);
	}
	extrudedMeshes = [];

	extrude = false;
	extrude_shape = null;
	extrude_y = null;
}

function addVertices() {
	if (sceneIndex != 2) {
		return;
	}
	// var cube = scene.getObjectByName("cCube");
	if (selectedObject["3dmesh"]) {
		for (v = 0; v < selectedObject["3dmesh"].geometry.vertices.length; v++) {
			var vector = selectedObject["3dmesh"].geometry.vertices[v].clone();
			vector.applyMatrix4( selectedObject["3dmesh"].matrixWorld );

			var geometry = new THREE.BoxGeometry(1, 1, 1 );
			var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
			var verticeLabel = new THREE.Mesh( geometry, material );

			assignChildrenName(verticeLabel, "vertice", verticeLabel.position);

			verticeLabel.position.set(vector.x, vector.y, vector.z);
			verticeLabel.atIndex = v;
			sceneManager[thisIndex].scene.add( verticeLabel );
			selectedObjectVertices.push(verticeLabel);
		}
	}
}

function removeVertices() {
	if (sceneIndex != 2) {
		return;
	}
	for (c = 0; c < selectedObjectVertices.length; c++) {
		sceneManager[thisIndex].scene.remove(selectedObjectVertices[c]);
	}
}


/** Find closest vertice **/
function findClosestVertice() {
	if (sceneIndex != 2) {
		return;
	}
	if (selectedObjectVertices.length > 0) {
		var dist,
			minDist = distance3d(cursor.position, selectedObjectVertices[0]),
			smallest = selectedObjectVertices[0];

		for (var verticeIndex = 1; verticeIndex < selectedObjectVertices.length; verticeIndex++) {
			dist = distance3d(cursor.position, selectedObjectVertices[verticeIndex]);

			if (dist < minDist) {
				smallest = selectedObjectVertices[verticeIndex];
				minDist = dist;
			}
		}

		return smallest;
	}
	return null;
}

function exportToServer() {
	if (selectedObject["3dmesh"]) {
		var stlexporter = new THREE.STLExporter();
	    var objexporter = new THREE.OBJExporter();
	    var endpoint = "http://collavrate.zohaibahmed.com/export"

	    stlbody = stlexporter.parse(selectedObject["3dmesh"]);
	    objbody = objexporter.parse(selectedObject["3dmesh"]);

	    $.ajax({
		    beforeSend: function(xhrObj){
		        xhrObj.setRequestHeader("Content-Type","application/json");
		        xhrObj.setRequestHeader("Accept","application/json");
		    },
		    type: "POST",
		    url: endpoint,       
		    data: JSON.stringify({"uuid": window.uuid, "stlbody": stlbody, "objbody": objbody}),               
		    dataType: "json",
		    success: function(json){
		       console.log("Sent to Server");
		    }
		});

	}
}

