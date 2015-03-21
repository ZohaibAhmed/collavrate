var mouse = new THREE.Vector2();

function onMouseMove( event ) {

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;		

}

function getClosestVertice() {
	var raycaster = new THREE.Raycaster();
	var cube = scene.getObjectByName("cCube"); 
	// update the picking ray with the camera and mouse position	
	raycaster.setFromCamera( mouse, camera );

	// calculate objects intersecting the picking ray
	var intersects = raycaster.intersectObjects( cubeVertices );
	for ( var i = 0; i < intersects.length; i++ ) {

		if (intersects[ i ].object.name == "vertice") {
			
			var object = intersects[ i ].object;

			// TODO: fix this... it needs to move in a certain way.
			cube.geometry.verticesNeedUpdate = true; // set the flag to true
			cube.geometry.vertices[object.atIndex].z += 0.1; // this is the vertice
			// cube.geometry.vertices[object.atIndex].y += mouse.y; // this is the vertice

		}
	
	}
}

window.addEventListener( 'mousemove', onMouseMove, false );
window.addEventListener( 'mousedown', getClosestVertice, false );