function handManager(socket) {
    this.hands = {};
    this.socket = socket;
    this.colours = [0xFF00FF, 0xfae157, 0xd9ff4a, 0x00FFFF, 0xFF9966];
};

handManager.prototype.addHand = function(myoId, myo) {

    this.hands[myoId] = {
                            id: myoId,
                            myo: myo,
                            cube: null,
                            pos_x: null,
                            pos_y: null,
                            pos_z: 0,
                            current_status: false,
                            old_cube_x: 0,
                            old_cube_y: 0,
                            unlocked: false,
                            colour: this.colours[Object.keys(window.myoManager.hands).length],
                            currentLine: null              
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
    var line = this.createLine(data.token);
    this.hands[data.token].currentLine = line;
    scene.add(line);
};

handManager.prototype.addToLine = function(data) {
    var myoId = data.token,
        myo_manager = window.myoManager.hands[data.token];

    if (data.currentStatus) {
        if (myo_manager.currentLine) {
            myo_manager.currentLine.geometry.vertices.push(myo_manager.currentLine.geometry.vertices.shift()); //shift the array
            myo_manager.currentLine.geometry.vertices[100000-1] = new THREE.Vector3(data.x, data.y, 0); //add the point to the end of the array
            myo_manager.currentLine.geometry.verticesNeedUpdate = true;
        }
    };

    // move the position
    myo_manager.cube.position.set(data.x, data.y, 0);

};

handManager.prototype.renderOnScene = function(myoId, listen) {

    // Create a new cube
    var geometry = new THREE.BoxGeometry(12, 12, 12);
    var material = new THREE.MeshPhongMaterial({color: this.hands[myoId].colour});
    this.hands[myoId].cube = new THREE.Mesh(geometry, material);

    this.hands[myoId].cube.rotation.x = -0.5*Math.PI;

    this.hands[myoId].cube.castShadow = true;
    this.hands[myoId].cube.receiveShadow = true;

    this.hands[myoId].cube.position.set(0, 0, 0);

    scene.add(this.hands[myoId].cube);

    renderer.render(scene, camera);
    
    if (listen) {
        this.createListener(myoId);
    }
};

handManager.prototype.createLine = function(myoId) {

    var geometry, line, lineMaterial,
    MAX_LINE_POINTS = 100000;

    lineMaterial = new THREE.MeshBasicMaterial({
        color: window.myoManager.hands[myoId].colour
    });

    geometry = new THREE.Geometry();
    for (i=0; i<MAX_LINE_POINTS; i++){
        geometry.vertices.push(new THREE.Vector3(window.myoManager.hands[myoId].cube.position.x, window.myoManager.hands[myoId].cube.position.y, 0));
    }
    
    line = new THREE.Line(geometry, lineMaterial);
    line.geometry.dynamic = true;

    return line;

}

handManager.prototype.createListener = function(myoId) {
    // make sure this myo is unlocked

    this.hands[myoId].myo.on('fist', function(edge){
        //Edge is true if it's the start of the pose, false if it's the end of the pose
        if(edge) {
            window.myoManager.hands[myoId].current_status = !window.myoManager.hands[myoId].current_status;

            if (window.myoManager.hands[myoId].current_status) {
                // start the line

                var myo_manager = window.myoManager.hands[myoId];
                var geometry, line, lineMaterial,
                MAX_LINE_POINTS = 100000;

                lineMaterial = new THREE.MeshBasicMaterial({
                    color: window.myoManager.hands[myoId].colour
                });

                geometry = new THREE.Geometry();
                for (i=0; i<MAX_LINE_POINTS; i++){
                    geometry.vertices.push(new THREE.Vector3(window.myoManager.hands[myoId].cube.position.x, window.myoManager.hands[myoId].cube.position.y, 0));
                }
                
                line = new THREE.Line(geometry, lineMaterial);
                line.geometry.dynamic = true;

                window.myoManager.socket.emit('createLine', {   lineSegment: window.lineSegment, 
                                                                token: window.uuid, 
                                                                x: myo_manager.cube.position.x, 
                                                                y: myo_manager.cube.position.y 
                                                            });

                window.lineSegment++;


                window.myoManager.hands[myoId].currentLine = line;
                scene.add(line);
            }
        }
    });

    this.hands[myoId].myo.on('arm_synced', function(){ 
        console.log("synced");
    });

    this.hands[myoId].myo.on('position', function(x, y, theta){ 
        var displacement_x, displacement_y, // for movement
            material, radius, segments, circleGeometry, circle, // for drawing
            myo_manager = window.myoManager.hands[myoId];


        if (myo_manager.unlocked == false) {
            // unlock the myo
            myo_manager.myo.unlock();
            // set the locking policy
            myo_manager.myo.setLockingPolicy("none");
            // set flag to set in the manager
            myo_manager.unlocked = true;
        }

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

        if (myo_manager.cube.position.x < 100 && myo_manager.cube.position.x > -100) {
            myo_manager.cube.translateX(displacement_x);
        } else {
            if (displacement_x < 0 && myo_manager.cube.position.x >= 100) {
                myo_manager.cube.translateX(displacement_x);
            } else if (displacement_x > 0 && myo_manager.cube.position.x <= -100) {
                myo_manager.cube.translateX(displacement_x);
            }
        }
        if (myo_manager.cube.position.y < 100 && myo_manager.cube.position.y > -100) {
            myo_manager.cube.translateZ(displacement_y);
        } else {
            if (displacement_y < 0 && myo_manager.cube.position.y >= 100) {
                myo_manager.cube.translateZ(displacement_y);
            } else if (displacement_y > 0 && myo_manager.cube.position.y <= -100) {
                myo_manager.cube.translateZ(displacement_y);
            }
        }
        
        myo_manager.pos_x = x;
        myo_manager.pos_y = y;

        if (myo_manager.current_status 
                && (Math.abs(myo_manager.old_cube_x - myo_manager.cube.position.x) > 0.02)
                && (Math.abs(myo_manager.old_cube_y - myo_manager.cube.position.y) > 0.02)
                ) {

            // we're just going to add on to the current line
            myo_manager.currentLine.geometry.vertices.push(myo_manager.currentLine.geometry.vertices.shift()); //shift the array
            myo_manager.currentLine.geometry.vertices[100000-1] = new THREE.Vector3(myo_manager.cube.position.x, myo_manager.cube.position.y, 0); //add the point to the end of the array
            myo_manager.currentLine.geometry.verticesNeedUpdate = true;
        }

        window.myoManager.socket.emit('myolocation', {  token: window.uuid, 
                                                        x: myo_manager.cube.position.x, 
                                                        y: myo_manager.cube.position.y, 
                                                        currentStatus: myo_manager.current_status,
                                                        lineSegment: window.lineSegment 
                                                    });

        myo_manager.old_cube_x = myo_manager.cube.position.x;
        myo_manager.old_cube_y = myo_manager.cube.position.y;

             
    });
};

var initScene = function () {

    window.scene = new THREE.Scene();
    window.renderer = new THREE.WebGLRenderer({
        alpha: true
    });

    window.renderer.setClearColor(0x000000, 1);
    window.renderer.setSize(window.innerWidth, window.innerHeight);

    window.renderer.domElement.style.position = 'fixed';
    window.renderer.domElement.style.top = 0;
    window.renderer.domElement.style.left = 0;
    window.renderer.domElement.style.width = '100%';
    window.renderer.domElement.style.height = '100%';

    document.body.appendChild(window.renderer.domElement);

    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set( 0, 0.5, 1 );
    window.scene.add(directionalLight);

    window.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    window.camera.position.fromArray([0, 0, 250]);
    window.camera.lookAt(new THREE.Vector3(0, 0, 0));

    window.addEventListener('resize', function () {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.render(scene, camera);

    }, false);

    scene.add(camera);
};

var loadScene = function(data) {
    var currentLineSegment;
    for (j = 0; j < data.length; j++) {
        var lineSegment = data[j].line_segment,
            token = data[j].token,
            x = data[j].x,
            y = data[j].y;

        // check to see if a myo with this token is registered
        if (!window.myoManager.hands[token]) {
            // create this...
            window.myoManager.createMyo({token: token});
            currentLineSegment = null;
        }

        // // this is a new line
        if (!currentLineSegment || lineSegment != currentLineSegment) {
            currentLineSegment = lineSegment;
            window.myoManager.lineCreated({token: token});
        } else {
            // add to the previous line segment
            window.myoManager.addToLine({token: token, currentStatus: true, x: x, y: y});
        }
    }

    render(); // the render loop
}

var initMyo = function() {
    window.lineSegment = 0;

    socket = io.connect('http://collavrate.zohaibahmed.com/', {origins: '*'});

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
                // this is me.
                myo = Myo.create(0);
                window.myoManager.addHand(window.uuid, myo);
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

    // init = true;
    // index = 0;
    // while (index <= 0) {
    //     myo = Myo.create(index);
    //     myoManager.addHand(index, myo);
    //     index++;
    // }
};

var render = function() {
    requestAnimationFrame( render );
    renderer.render( scene, camera );
}

$(document).keyup(function(e) {
    var key = String.fromCharCode(e.keyCode);

    if (key == "C") {
        $.get( "http://collavrate.zohaibahmed.com/clear", function( data ) {
            console.log(data);
            
            // TODO: find a way to remove all the lines from the screen


        });
    }
});

initScene();
initMyo();

