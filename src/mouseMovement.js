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
	moveCursor(mouse.x, mouse.y);

	if (drawing) {
		draw();
	}

}

function onMouseDown(event) {
	console.log(sceneIndex);
	if (sceneIndex == 0) {
		// this is the hacker space 
		// TODO: change index
		getClosestVertice();
	} else if (sceneIndex == 2) {
		// this is the drawing world
		if (drawing == false) {
			drawing = true;
			startDraw();
		}
	}
}

function onMouseUp(event) {
	drawing = false;
}

function getClosestVertice() {
	var raycaster = new THREE.Raycaster();
	var cube = scene.getObjectByName("cCube"); 
	// update the picking ray with the camera and mouse position	
	

	var dir = new THREE.Vector3();
	mouse3.unproject(camera);
	dir.set(0, 0, -1).transformDirection(camera.matrixWorld);

	raycaster.set( mouse3, dir );

	// calculate objects intersecting the picking ray
	var intersects = raycaster.intersectObjects( cubeVertices );
	for ( var i = 0; i < intersects.length; i++ ) {

		if (intersects[ i ].object.name == "vertice") {
			
			var object = intersects[ i ].object;

			// TODO: fix this... it needs to move in a certain way.
			cube.geometry.verticesNeedUpdate = true; // set the flag to true
			cube.geometry.vertices[object.atIndex].z += 0.1; // this is the vertice
			// cube.geometry.vertices[object.atIndex].y += mouse3.y; // this is the vertice

		}
	
	}
}

window.addEventListener( 'mousemove', onMouseMove, false );
window.addEventListener( 'mousedown', onMouseDown, false );
window.addEventListener( 'mouseup', onMouseUp, false );
