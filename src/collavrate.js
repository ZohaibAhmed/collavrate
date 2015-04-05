function handManager(socket) {
    this.hands = {};
    this.socket = socket;
    this.colours = [0xFF00FF, 0xfae157, 0xd9ff4a, 0x00FFFF, 0xFF9966];
    this.helper = null;
}

handManager.prototype.addHand = function(myoId, myo, secondMyo) {

    this.hands[myoId] = {
                            id: myoId,
                            myo: myo,
                            secondMyo: secondMyo,
                            cube: null,
                            pos_x: null,
                            pos_y: null,
                            pos_z: 0,
                            current_status: false,
                            old_cube_x: 0,
                            old_cube_y: 0,
                            unlocked: false,
                            colour: this.colours[Object.keys(window.myoManager.hands).length],
                            currentLine: null,
                            enabled: false, // this keeps track whether we're using a myo or not
                            currentVertices: []       
                    };
    this.renderOnScene(myoId, true);
};

handManager.prototype.createMyo = function(data) {
    var myoId = data.token;

    this.hands[myoId] = {
            id: myoId,
            cube: null,
            colour: this.colours[Object.keys(window.myoManager.hands).length],
            currentLine: null
    };

    this.renderOnScene(myoId);
};

handManager.prototype.lineCreated = function(data) {
    var line = this.createLine(data.token, data);
    this.hands[data.token].currentLine = line;
    scene.add(line);
};

handManager.prototype.addToLine = function(data) {
    var myoId = data.token,
        myo_manager = window.myoManager.hands[data.token];

    if (data.currentStatus) {
        if (myo_manager.currentLine) {
            myo_manager.currentLine.geometry.vertices.push(myo_manager.currentLine.geometry.vertices.shift()); //shift the array
            myo_manager.currentLine.geometry.vertices[100000-1] = new THREE.Vector3(data.x, data.y, data.z); //add the point to the end of the array
            myo_manager.currentLine.geometry.verticesNeedUpdate = true;
        }
    }

    // move the position
    myo_manager.cube.position.set(data.x, data.y, 0);

};

handManager.prototype.renderOnScene = function(myoId, listen) {

    // Create a new cube
    var geometry = new THREE.BoxGeometry(2, 2, 2);
    var material = new THREE.MeshPhongMaterial({color: this.hands[myoId].colour});
    this.hands[myoId].cube = new THREE.Mesh(geometry, material);

    this.hands[myoId].cube.rotation.x = -0.5*Math.PI;

    this.hands[myoId].cube.castShadow = true;
    this.hands[myoId].cube.receiveShadow = true;

    this.hands[myoId].cube.position.set(0, 0, 0);

    this.hands[myoId].cube.name = "hand";
    
    
    this.toggleVisibility(false);

    if (listen) {
        this.createListener(myoId);
    }
};

handManager.prototype.toggleVisibility = function(isVisible) {
    if (window.uuid) {
        this.hands[window.uuid].cube.visible = isVisible;
    }
    
};

handManager.prototype.setHandPosition = function(position, whiteboard) {
    if (window.uuid) {
        if (whiteboard) {
            var helper = new THREE.BoundingBoxHelper(whiteboard, 0xff0000);
            helper.update();

            this.helper = helper;

            this.hands[window.uuid].cube.position.set(position.x, helper.box.max.y / 2, position.z - 5);
        } else {
            if (!position.x) {
                // only change the z
                this.hands[window.uuid].cube.position.z = position.z;
            } else {
                this.hands[window.uuid].cube.position.set(position.x, position.y, position.z);
            }
        }
    }
};

handManager.prototype.createLine = function(myoId, data) {

    var geometry, line, lineMaterial,
    MAX_LINE_POINTS = 100000;

    lineMaterial = new THREE.MeshBasicMaterial({
        color: window.myoManager.hands[myoId].colour
    });

    geometry = new THREE.Geometry();
    for (i=0; i<MAX_LINE_POINTS; i++){
        if (data) {
            geometry.vertices.push(new THREE.Vector3(data.x, data.y, data.z));
        } else {
            geometry.vertices.push(new THREE.Vector3(window.myoManager.hands[myoId].cube.position.x, window.myoManager.hands[myoId].cube.position.y, window.myoManager.hands[myoId].cube.position.z));
        }
    }
    
    line = new THREE.Line(geometry, lineMaterial);
    line.geometry.dynamic = true;

    return line;

};

handManager.prototype.createListener = function(myoId) {
    this.hands[myoId].myo.on('pose', function(poseName){
        console.log("right Myo pose: " + poseName);
    });

    this.hands[myoId].secondMyo.on('pose', function(poseName){
        console.log("left Myo pose: " + poseName);
    });

    // handle rotation of object
    this.hands[myoId].secondMyo.on('wave_in', function(edge) {
        window.myoManager.hands[myoId].secondMyo.timer(edge, 500, function(){
            // hold this pose for 0.5 seconds
            console.log("rotate to left");
            rotateLeft = true;
        });
    });
    this.hands[myoId].secondMyo.on('wave_out', function(edge) {
        window.myoManager.hands[myoId].secondMyo.timer(edge, 500, function(){
            // hold this pose for 0.5 seconds
            console.log("rotate to right");
            rotateRight = true;
        });
    });

    // handle toolset rotation
    this.hands[myoId].myo.on('wave_in', function(edge) {
        window.myoManager.hands[myoId].myo.timer(edge, 500, function(){
            // hold this pose for 0.5 seconds
            console.log("rotate to left");
            if (toolbelt.toolGroup) {
                toolbelt.startRotate("left");
            }

        });
    });
    this.hands[myoId].myo.on('wave_out', function(edge) {
        window.myoManager.hands[myoId].myo.timer(edge, 500, function(){
            // hold this pose for 0.5 seconds
            console.log("rotate to right");
            if (toolbelt.toolGroup) {
                toolbelt.startRotate("right");
            }
        });
    });

    this.hands[myoId].myo.on('fingers_spread', function(edge){
        window.myoManager.hands[myoId].myo.timer(edge, 2000, function(){
            // camControls.autoForward = true;
        });
    });

    // unselect whatever we have selected
    this.hands[myoId].secondMyo.on('fingers_spread', function(edge){
        window.myoManager.hands[myoId].secondMyo.timer(edge, 2000, function(){
            if (selectedObject) {
                selectedObject = null;
                secondSelectedObject = null;
                toolbelt.removeTools(thisIndex);
                console.log("You have unselected the object");
            }
        });
    });

    this.hands[myoId].myo.on('rest', function(edge){
        window.myoManager.hands[myoId].myo.timer(edge, 250, function(){
            var myo_manager = window.myoManager.hands[window.uuid];
            if (sceneIndex == 2 && myo_manager.currentVertices.length > 0) {
                window.myoManager.hands[myoId].current_status = false;
                console.log("FINISHED DRAW");
                // we should draw the shape
                finishDraw(myo_manager.currentVertices);
                myo_manager.currentVertices = [];
            }

            camControls.autoForward = false;
            endExtrude(); // stop extruding
            console.log("RIGHT REST");

            if (MOVE) {
                MOVE = false;
            }
        });
    });

    this.hands[myoId].secondMyo.on('rest', function(edge){
        window.myoManager.hands[myoId].secondMyo.timer(edge, 250, function(){
            rotateLeft = false;
            rotateRight = false;
        });
    });

    // use this to select an object
    this.hands[myoId].secondMyo.on('fist', function(edge){
        window.myoManager.hands[myoId].secondMyo.timer(edge, 250, function(){
            console.log("---- FIST ------");
            if (selectedObject) {
                if (selectedObject["3dmesh"] && manipulateObject) {
                    // we already have one object selected
                    // so select the second
                    secondSelectedObject = getObjectsAtMouse();
                    secondSelectedObjectMesh = secondSelectedObject["mesh"];
                    return;
                } 
            }

            if (toolbelt.enabled) {
                return;
            }

            // Find if any object is selected
            selectedObject = getObjectsAtMouse();
            selectedObjectMesh = selectedObject["mesh"]
            console.log("You have selected object: " + selectedObjectMesh);

            if (selectedObjectMesh) {
                var helper = new THREE.BoundingBoxHelper(selectedObjectMesh, 0xff0000);
                helper.update();

                console.log(selectedObjectMesh.position);
                // show the toolbar above this object
                toolbelt.addTools(thisIndex, helper.box.max.x, helper.box.max.y + 20, selectedObjectMesh.position.z)
            }
        });
    });

    this.hands[myoId].myo.on('fist', function(edge){
        //Edge is true if it's the start of the pose, false if it's the end of the pose
        window.myoManager.hands[myoId].myo.timer(edge, 500, function(){
            var myo_manager = window.myoManager.hands[myoId];
            if (toolbelt.getCurrentToolName() == "Extrude") {
                // we extrude here...
                console.log("begin extruding");
                beginExtrude(selectedObject["shape"], selectedObject["mesh"]);
            } else if (toolbelt.getCurrentToolName() == "Move") {
                // move the selected object with the cursor
                MOVE = true;
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

                    var intersect_bsp = first.intersect(second);
                    var result = intersect_bsp.toMesh( new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading }) );

                    result.geometry.computeVertexNormals();
                }

                // remove the selectedObject["3dmesh"] from scene
                sceneManager[thisIndex].scene.remove( selectedObject["3dmesh"] );
                sceneManager[thisIndex].scene.remove( secondSelectedObject["3dmesh"] );

                sceneManager[thisIndex].scene.add( result );
                console.log("unselecting");
                selectedObject = null;
                secondSelectedObject = null;
            } else {
                // we draw here...
                window.myoManager.hands[myoId].current_status = !window.myoManager.hands[myoId].current_status;
                

                if (window.myoManager.hands[myoId].current_status) {
                    // start the line

                    var geometry, line, lineMaterial,
                    MAX_LINE_POINTS = 100000;

                    lineMaterial = new THREE.MeshBasicMaterial({
                        color: window.myoManager.hands[myoId].colour
                    });

                    geometry = new THREE.Geometry();
                    for (i=0; i<MAX_LINE_POINTS; i++){
                        geometry.vertices.push(new THREE.Vector3(window.myoManager.hands[myoId].cube.position.x, window.myoManager.hands[myoId].cube.position.y, window.myoManager.hands[myoId].cube.position.z));
                    }
                    
                    line = new THREE.Line(geometry, lineMaterial);
                    line.geometry.dynamic = true;

                    window.myoManager.socket.emit('createLine', {   lineSegment: window.lineSegment, 
                                                                    token: window.uuid, 
                                                                    x: myo_manager.cube.position.x, 
                                                                    y: myo_manager.cube.position.y,
                                                                    z: myo_manager.cube.position.z
                                                                });

                    window.lineSegment++;


                    window.myoManager.hands[myoId].currentLine = line;
                    scene.add(line);
                } else {
                    // check if we're in scene 3
                    if (sceneIndex == 2) {
                        // we should draw the shape
                        finishDraw(myo_manager.currentVertices);
                        myo_manager.currentVertices = [];
                    }
                }
            }
        });
    });

    this.hands[myoId].myo.on('arm_synced', function(){ 
        console.log("synced");
        var myo_manager = window.myoManager.hands[window.uuid];

        //if (myo_manager.unlocked == false) {
            // unlock the myo
            myo_manager.myo.unlock();
            // set the locking policy
            myo_manager.myo.setLockingPolicy("none");
            // set flag to set in the manager
            myo_manager.unlocked = true;
        //}

    });

    this.hands[myoId].secondMyo.on('arm_synced', function(){ 
        console.log("synced");
    });

    this.hands[myoId].myo.on('position', function(x, y, theta){ 
        var displacement_x, displacement_y, // for movement
            material, radius, segments, circleGeometry, circle, // for drawing
            myo_manager = window.myoManager.hands[myoId];


        if (myo_manager.cube.visible) {
            // translate the shape to x, y
            x = x * 300;
            y = y * 300;

            // set the origin
            if (!myo_manager.pos_x || !myo_manager.pos_y) {
                myo_manager.pos_x = x;
                myo_manager.pos_y = y;
            }

            // only run this chunk of code every 20 ms
            // we need to translate x, y by the displacement
            displacement_x = -(myo_manager.pos_x - x);
            displacement_y = -(myo_manager.pos_y - y);

            if (window.myoManager.helper) {
                maxX = window.myoManager.helper.box.max.x;
                minX = window.myoManager.helper.box.min.x;
                maxY = window.myoManager.helper.box.max.y;
                minY = 10;
            } else {
                maxX = 100;
                minX = -100;
                maxY = 100;
                minY = -100;
            }

            if (myo_manager.cube.position.x < maxX - 10 && myo_manager.cube.position.x > minX - 5) {
                myo_manager.cube.translateX(displacement_x);
            } else {
                if (displacement_x < 0 && myo_manager.cube.position.x >= maxX - 10) {
                    myo_manager.cube.translateX(displacement_x);
                } else if (displacement_x > 0 && myo_manager.cube.position.x <= minX - 5) {
                    myo_manager.cube.translateX(displacement_x);
                }
            }
            if (myo_manager.cube.position.y < maxY - 10 && myo_manager.cube.position.y > minY) {
                myo_manager.cube.translateZ(displacement_y);
            } else {
                if (displacement_y < 0 && myo_manager.cube.position.y >= maxY - 10) {
                    myo_manager.cube.translateZ(displacement_y);
                } else if (displacement_y > 0 && myo_manager.cube.position.y <= minY) {
                    myo_manager.cube.translateZ(displacement_y);
                }
            }
            
            myo_manager.pos_x = x;
            myo_manager.pos_y = y;

            if (myo_manager.current_status && (Math.abs(myo_manager.old_cube_x - myo_manager.cube.position.x) > 0.02) && (Math.abs(myo_manager.old_cube_y - myo_manager.cube.position.y) > 0.02)) {
                // we're just going to add on to the current line
                myo_manager.currentLine.geometry.vertices.push(myo_manager.currentLine.geometry.vertices.shift()); //shift the array
                myo_manager.currentLine.geometry.vertices[100000-1] = new THREE.Vector3(myo_manager.cube.position.x, myo_manager.cube.position.y, myo_manager.cube.position.z); //add the point to the end of the array
                myo_manager.currentLine.geometry.verticesNeedUpdate = true;

                myo_manager.currentVertices.push(new THREE.Vector2(myo_manager.cube.position.x, myo_manager.cube.position.y));
            }

            if (sceneIndex == 0) {
                window.myoManager.socket.emit('myolocation', {  token: window.uuid, 
                                                                x: myo_manager.cube.position.x, 
                                                                y: myo_manager.cube.position.y, 
                                                                z: myo_manager.cube.position.z,
                                                                currentStatus: myo_manager.current_status,
                                                                lineSegment: window.lineSegment 
                                                            });
            }

            if (extrude) {
                // we want to extrude the current shape
                var total_distance = Math.abs(extrude_y - myo_manager.cube.position.y);
                extrude_amount = Math.ceil(total_distance);

                if (extrude_amount > 0) {
                    extrudeShape();
                }
            }

            if (toolbelt.getCurrentToolName()) {
                if (toolbelt.getCurrentToolName().slice(0, 4) == "Skew") {
                    var closest = findClosestVertice();

                    if (closest) {
                        closest.material.color.setHex(0xff0000); 

                        if (closest != lastVerticeSelected && lastVerticeSelected) {
                            lastVerticeSelected.material.color.setHex(0x00ff00);
                            lastVerticeSelected = closest;
                        }
                    }
                }
            }

            if (MOVE && selectedObject["3dmesh"]) {
                selectedObject["3dmesh"].position.set(myo_manager.cube.position.x, myo_manager.cube.position.y, myo_manager.cube.position.z);
            }

            myo_manager.old_cube_x = myo_manager.cube.position.x;
            myo_manager.old_cube_y = myo_manager.cube.position.y;

        }
    });

    toolbelt.on('change', function(name) {
        console.log("TRIGGER: " + name);
        if (name.slice(0, 4) == "Skew") {
            // show the vertices
            if (selectedObject) {
                console.log("Adding Vertices");
                addVertices();
            }
            manipulateObject = null;
            secondSelectedObject = null;
        } else if (name == "Subtract" || name == "Union" || name == "Intersect") {
            // we're allowed to set the secondSelected Object
            manipulateObject = true;
        } else {
            manipulateObject = null;
            secondSelectedObject = null;
        }

    });
};

var loadScene = function(data) {
    var currentLineSegment;
    for (j = 0; j < data.length; j++) {
        var lineSegment = data[j].line_segment,
            token = data[j].token,
            x = data[j].x,
            y = data[j].y,
            z = data[j].z;

        // check to see if a myo with this token is registered
        if (!window.myoManager.hands[token]) {
            // create this...
            window.myoManager.createMyo({token: token});
            currentLineSegment = null;
        }

        // // this is a new line
        if (!currentLineSegment || lineSegment != currentLineSegment) {
            currentLineSegment = lineSegment;
            window.myoManager.lineCreated({token: token, x: x, y: y, z: z});
        } else {
            // add to the previous line segment
            window.myoManager.addToLine({token: token, currentStatus: true, x: x, y: y, z: z});
        }
    }

};

var initMyo = function() {
    window.lineSegment = 0;

    var socket = io.connect('http://collavrate.zohaibahmed.com/', {origins: '*', 'sync disconnect on unload': true});

    $(window).on('beforeunload', function(){
        socket.close();
    });

    window.myoManager = new handManager(socket);

    // initialize the scene with the current world information
    $.get( "http://collavrate.zohaibahmed.com/world", function( data ) {
        // once this is done, then we should do the rest...
        loadScene(data);

        socket.on('uuid', function (data) {
            console.log(data);
            
            if (window.uuid) {
                window.myoManager.createMyo(data);
            } else {
                window.uuid = data.token;

                console.log("Register my Myos");
                // this is me, we should create two myos
                // var myo = Myo.create(0); // right
                // var secondMyo = Myo.create(1); // left

                var secondMyo = Myo.create(0); // right
                var myo = Myo.create(1); // left

                window.myoManager.addHand(window.uuid, myo, secondMyo);
                // set the cursor to the cube
                cursor = window.myoManager.hands[window.uuid].cube;
                window.myoManager.toggleVisibility(true);
                // set position
                window.myoManager.setHandPosition({x: 0, y: 0, z: -10});
            }
            
        });

        socket.on('currentUsers', function(data) {
            console.log(data);
            for (k = 0; k < data.length; k++) {
                if (data[k] != window.uuid) {
                    window.myoManager.createMyo({token: data[k]});
                }
            }
        });

        socket.on('lineCreated', function(data) {
            if (data.token && data.token != window.uuid && window.myoManager.hands[data.token]) {
                window.myoManager.lineCreated(data);
            }
        });
        socket.on('myoTracking', function(data) {
            if (data.token && data.token != window.uuid && window.myoManager.hands[data.token]) {
                window.myoManager.addToLine(data);
            }
        });

    });

};

initMyo();

