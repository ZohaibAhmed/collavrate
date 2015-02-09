function handManager() {
    this.hands = [];
    this.colours = [0xfae157, 0xd9ff4a];
};

handManager.prototype.addHand = function(myoId, myo) {
    this.hands.push({
                        myoId: {
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
                                    colour: this.colours[myoId]
                                }
                    });
    this.renderOnScene(myoId);
};

handManager.prototype.renderOnScene = function(myoId) {
    // create a new cube
    var geometry = new THREE.BoxGeometry(12, 12, 12);
    var material = new THREE.MeshPhongMaterial({color: this.hands[myoId].myoId.colour});
    this.hands[myoId].cube = new THREE.Mesh(geometry, material);

    this.hands[myoId].cube.rotation.x = -0.5*Math.PI;

    this.hands[myoId].cube.castShadow = true;
    this.hands[myoId].cube.receiveShadow = true;

    this.hands[myoId].cube.position.set(0, 0, 0);

    scene.add(this.hands[myoId].cube);

    renderer.render(scene, camera);

    this.createListener(myoId);
};

handManager.prototype.createListener = function(myoId) {
    // make sure this myo is unlocked

    this.hands[myoId].myoId.myo.on('fist', function(edge){
        //Edge is true if it's the start of the pose, false if it's the end of the pose
        if(edge) {
            window.myoManager.hands[myoId].myoId.current_status = !window.myoManager.hands[myoId].myoId.current_status;
        }
    });

    this.hands[myoId].myoId.myo.on('position', function(x, y, theta){ 
        var displacement_x, displacement_y, // for movement
            material, radius, segments, circleGeometry, circle, // for drawing
            myo_manager = window.myoManager.hands[myoId];


        if (myo_manager.myoId.unlocked == false) {
            // unlock the myo
            myo_manager.myoId.myo.unlock();
            // set the locking policy
            myo_manager.myoId.myo.setLockingPolicy("none");
            // set flag to set in the manager
            myo_manager.myoId.unlocked = true;
        }

        // translate the shape to x, y
        x = x * 300;
        y = y * 300;

        // set the origin
        if (!myo_manager.myoId.pos_x || !myo_manager.myoId.pos_y) {
            myo_manager.myoId.pos_x = x;
            myo_manager.myoId.pos_y = y;
        }

        // only run this chunk of code every 20 ms
        // we need to translate x, y by the displacement
        displacement_x = -(myo_manager.myoId.pos_x - x);
        displacement_y = -(myo_manager.myoId.pos_y - y);

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
        
        myo_manager.myoId.pos_x = x;
        myo_manager.myoId.pos_y = y;

        if (myo_manager.myoId.current_status 
                && (Math.abs(myo_manager.old_cube_x - myo_manager.cube.position.x) > 0.02)
                && (Math.abs(myo_manager.old_cube_y - myo_manager.cube.position.y) > 0.02)
                ) {

            // draw
            // TODO: find a better way to draw... 
            material = new THREE.MeshBasicMaterial({
                color: 0x15bdde
            });

            radius = 2;
            segments = 8;

            circleGeometry = new THREE.CircleGeometry( radius, segments );              
            circle = new THREE.Mesh( circleGeometry, material );
            circle.position.set(myo_manager.cube.position.x, myo_manager.cube.position.y, 0);
            scene.add( circle );
        }

        myo_manager.old_cube_x = myo_manager.cube.position.x;
        myo_manager.old_cube_y = myo_manager.cube.position.y;

        renderer.render(scene, camera);
             
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

    renderer.render(scene, camera);
};

var initMyo = function() {
    window.myoManager = new handManager();

    init = true;
    index = 0;
    while (index <= 0) {
        myo = Myo.create(index);
        myoManager.addHand(index, myo);
        index++;
    }
};


initScene();
initMyo();