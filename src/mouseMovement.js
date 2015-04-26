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
		if (sceneIndex == 0) {
			drawOnBoard(cursor.position.x, cursor.position.y, null, true);

		} else {
			drawLine();
		}
	}

	if (MOVE && selectedObject["3dmesh"]) {
		var myo_manager = window.myoManager.hands[window.uuid];
        selectedObject["3dmesh"].position.set(myo_manager.cube.position.x, myo_manager.cube.position.y, myo_manager.cube.position.z);
    }
}

function onMouseDown(event) {
	if (sceneIndex == 0) {
		// this is the hacker space 
		// TODO: change index
		getObjectsAtMouse(true);
		
		// startDraw();
		window.myoManager.hands[window.uuid].current_status = !window.myoManager.hands[window.uuid].current_status;
		if (window.myoManager.hands[window.uuid].current_status) {
			startDrawingOnBoard(window.uuid);
			drawing = true;
		}
	} else if (sceneIndex == 2) {
		// check to see if we've selected some object
		selectedObject = getObjectsAtMouse();

		if (selectedObject["mesh"] && !toolbelt.enabled) {
			var helper = new THREE.BoundingBoxHelper(selectedObject["mesh"], 0xff0000);
                helper.update();

			// turn on toolbelt.
			toolbelt.addTools(thisIndex, helper.box.max.x, helper.box.max.y + 20, selectedObject["mesh"].position.z)
		} else if (toolbelt.enabled) {
			// do other actions
			// this is the drawing world
			// check to see if tool is Skew

			if (toolbelt.getCurrentToolName() && (selectedObject["mesh"] || selectedObject["3dmesh"])) {
				if (toolbelt.getCurrentToolName().slice(0, 4) == "Skew") {
					getObjectsAtMouse(true);
				} else if (toolbelt.getCurrentToolName() == "Extrude") {
					// extrude
					beginExtrude(selectedObject["shape"], selectedObject["mesh"]);
				} else if (toolbelt.getCurrentToolName() == "Move" && selectedObject["3dmesh"]) {
					// move - NOTE: Only 3D objects are allowed to move...
					MOVE = true;
				} else if (toolbelt.getCurrentToolName() == "Export") { 
	                if (selectedObject["3dmesh"]) {
		                console.log("Going to export... To download, go to: http://collavrate.zohaibahmed.com/" + window.uuid + ".stl or .obj");
	                    // send this to the server
	                    exportToServer();
	                }
	            } else if (manipulateObject && secondSelectedObject && selectedObject) {
	            	console.log("about to do something SPECIAL");
	                // manipulate the object
	                var name = toolbelt.getCurrentToolName();

	                if (name == "Subtract") {
	                    var first    = new ThreeBSP(selectedObject["3dmesh"]);
	                    var second    = new ThreeBSP(secondSelectedObject["3dmesh"]);

	                    var subtract_bsp = first.subtract(second);
	                    var result = subtract_bsp.toMesh( new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading }) );

	                    result.geometry.computeVertexNormals();
	                } else if (name == "Union") {
	                    var first    = new ThreeBSP(selectedObject["3dmesh"].geometry);
	                    var second    = new ThreeBSP(secondSelectedObject["3dmesh"].geometry);

	                    var union_bsp = first.union(second);
	                    var result = union_bsp.toMesh( new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading }) );

	                    result.geometry.computeVertexNormals();
	                } else if (name == "Intersect") {

	                    var first    = new ThreeBSP(selectedObject["3dmesh"]);
	                    var second    = new ThreeBSP(secondSelectedObject["3dmesh"]);

	                    var intersect_bsp = second.intersect(first);
	                    var result = intersect_bsp.toMesh( new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading }) );

	                    result.geometry.computeVertexNormals();
	                }

	                // remove the selectedObject["3dmesh"] from scene
	                sceneManager[thisIndex].scene.remove( selectedObject["3dmesh"] );
	                sceneManager[thisIndex].scene.remove( secondSelectedObject["3dmesh"] );

	                sceneManager[thisIndex].scene.add( result );

	                // add result to the 3dmeshes
	                if (threedmeshes) {
	                    threedmeshes.push(result);
	                }
	            }
			} 

			// check to see if we already have an object selected, and the toolbar is currently on
			if (selectedObject) {
                if (selectedObject["3dmesh"]) {
                    if (manipulateObject) {
                        // we already have one object selected
                        // so select the second
                        secondSelectedObject = getObjectsAtMouse();
                        secondSelectedObjectMesh = secondSelectedObject["mesh"];
                        console.log("You have selected second object: " + secondSelectedObject["mesh"])

                        return;
                    } 
                }
            } 

		} else if (drawing == false && !toolbelt.enabled) {
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

	var ret = {};
	if (!vertice) {
		var mycursor = new THREE.Box3().setFromObject(cursor);

		for (var meshIndex = 0; meshIndex < meshes.length; meshIndex++) {
			var secondobject = new THREE.Box3().setFromObject(meshes[meshIndex]);

			var collision = mycursor.isIntersectionBox(secondobject);
			if (collision) {
				ret["mesh"] = meshes[meshIndex]
				ret["shape"] = shapes[meshIndex];
			}
		}

		for (var threemeshIndex = 0; threemeshIndex < threedmeshes.length; threemeshIndex++) {
			var secondobject = new THREE.Box3().setFromObject(threedmeshes[threemeshIndex]);

			var collision = mycursor.isIntersectionBox(secondobject);
			if (collision) {
				ret["3dmesh"] = threedmeshes[threemeshIndex];
			}
		}

		return ret;
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
