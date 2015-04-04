var mouse = new THREE.Vector2(),
	mouse3 = new THREE.Vector3(),
	drawing = false;

function onMouseMove( event ) {
	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
	mouse.x = (( event.clientX / window.innerWidth ) * 2 - 1) * 100;
	mouse.y = (- ( event.clientY / window.innerHeight ) * 2 + 1) * 100;		

	mouse3.x = (( event.clientX / window.innerWidth ) * 2 - 1);
	mouse3.y = (- ( event.clientY / window.innerHeight ) * 2 + 1);		
	mouse3.z = -1;
	//moveCursor(mouse.x, mouse.y);

	if (drawing) {
		drawLine();
	}
}

function onMouseDown(event) {
	if (sceneIndex == 0) {
		// this is the hacker space 
		// TODO: change index
		getObjectsAtMouse(true);
	} else if (sceneIndex == 2) {
		// this is the drawing world
		selectedObject = getObjectsAtMouse();
		if (selectedObject) {
			// we have an object.. 
			beginExtrude(selectedObject["shape"]); // i guess we'll take the first
		} else if (drawing == false) {
			drawing = true;
			startDraw(event);
		}
	}
}

function onMouseUp(event) {
	drawing = false;
	if (sceneIndex == 2) {
		finishDraw();
		endExtrude();
	}
}

function getObjectsAtMouse(vertice) {
	var raycaster = new THREE.Raycaster();
	var cube = scene.getObjectByName("cCube"); 
	// update the picking ray with the camera and mouse position	
	
	var dir = new THREE.Vector3();
	mouse3.unproject(camera);
	dir.set(0, 0, -1).transformDirection(camera.matrixWorld);

	raycaster.set( mouse3, dir );

	var objects = [];
	var intersects;
	// calculate objects intersecting the picking ray
	if (vertice) {
		intersects = raycaster.intersectObjects( selectedObjectVertices );
	} else {
		intersects = raycaster.intersectObjects( meshes, true );
	}

	if (!vertice) {
		var mycursor = new THREE.Box3().setFromObject(cursor);

		for (var meshIndex = 0; meshIndex < meshes.length; meshIndex++) {
			var secondobject = new THREE.Box3().setFromObject(meshes[meshIndex]);

			var collision = mycursor.isIntersectionBox(secondobject);
			if (collision) {
				return {"mesh": meshes[meshIndex], "shape": shapes[meshIndex]};
			}
		}
	} else {
	
		for ( var i = 0; i < intersects.length; i++ ) {
			alert(intersects[ i ].object.name);

			if (intersects[ i ].object.name == "vertice" && vertice) {
				
				var object = intersects[ i ].object;

				// TODO: fix this... it needs to move in a certain way.
				cube.geometry.verticesNeedUpdate = true; // set the flag to true
				cube.geometry.vertices[object.atIndex].z += 0.1; // this is the vertice
			}
		}
	}

	return false;
}

window.addEventListener( 'mousemove', onMouseMove, false );
window.addEventListener( 'mousedown', onMouseDown, false );
window.addEventListener( 'mouseup', onMouseUp, false );
