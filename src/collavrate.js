
        
var myoX = 0, myoY = 0, myoZ = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

function handManager() {
    this.hands = [];
};

handManager.prototype.addHand = function(myoId, myo) {

    this.hands.push({
                        myoId: {
                                    id: myoId,
                                    myo: myo,
                                    cube: null,
                                    pos_x: 50,
                                    pos_y: 50,
                                    pos_z: 0,
                                    current_status: true,
                                    old_cube_x: 0,
                                    old_cube_y: 0
                                }
                    });
    this.renderOnScene(myoId);
};

handManager.prototype.renderOnScene = function(myoId) {


    // create a new cube
    var geometry = new THREE.BoxGeometry(12, 12, 12);
    var material = new THREE.MeshPhongMaterial({color: 0x15bdde});
    this.hands[myoId].cube = new THREE.Mesh(geometry, material);

    this.hands[myoId].cube.rotation.x = -0.5*Math.PI;

    this.hands[myoId].cube.castShadow = true;
    this.hands[myoId].cube.receiveShadow = true;


    scene.add(this.hands[myoId].cube);

    renderer.render(scene, camera);

    this.createListener(myoId);
};

handManager.prototype.createListener = function(myoId) {
    window.myoManager.hands[myoId].current_status = true;
    this.hands[myoId].myoId.myo.on('fist', function(edge){
        //Edge is true if it's the start of the pose, false if it's the end of the pose
        if(edge) {
            window.myoManager.hands[myoId].current_status = !window.myoManager.hands[myoId].current_status;
            console.log("Fist clenched!");
            window.myoManager.hands[myoId].myoId.myo.zeroOrientation();
        }
    });


    this.hands[myoId].myoId.myo.on('position', function(x, y, theta){ 
        // translate the shape to x, y
        x = x * 300;
        y = y * 300;


        // if (!window.myoManager.hands[myoId].myoId.pos_x || !window.myoManager.hands[myoId].myoId.pos_y) {
        //     window.myoManager.hands[myoId].myoId.pos_x = x;
        //     window.myoManager.hands[myoId].myoId.pos_y = y;
        // }

        // only run this chunk of code every 20 ms
        // we need to translate x, y by the displacement
        var displacement_x = -(window.myoManager.hands[myoId].myoId.pos_x - x);
        var displacement_y = -(window.myoManager.hands[myoId].myoId.pos_y - y);

        if (window.myoManager.hands[myoId].cube.position.x < 100 && window.myoManager.hands[myoId].cube.position.x > -100) {
            window.myoManager.hands[myoId].cube.translateX(displacement_x);
        } else {
            if (displacement_x < 0 && window.myoManager.hands[myoId].cube.position.x >= 100) {
                window.myoManager.hands[myoId].cube.translateX(displacement_x);
            } else if (displacement_x > 0 && window.myoManager.hands[myoId].cube.position.x <= -100) {
                window.myoManager.hands[myoId].cube.translateX(displacement_x);
            }
        }
        if (window.myoManager.hands[myoId].cube.position.y < 100 && window.myoManager.hands[myoId].cube.position.y > -100) {
            window.myoManager.hands[myoId].cube.translateZ(displacement_y);
        } else {
            if (displacement_y < 0 && window.myoManager.hands[myoId].cube.position.y >= 100) {
                window.myoManager.hands[myoId].cube.translateZ(displacement_y);
            } else if (displacement_y > 0 && window.myoManager.hands[myoId].cube.position.y <= -100) {
                window.myoManager.hands[myoId].cube.translateZ(displacement_y);
            }
        }
        
        window.myoManager.hands[myoId].myoId.pos_x = x;
        window.myoManager.hands[myoId].myoId.pos_y = y;

        if (window.myoManager.hands[myoId].current_status 
                && (Math.abs(window.myoManager.hands[myoId].old_cube_x - window.myoManager.hands[myoId].cube.position.x) > 0.02)
                && (Math.abs(window.myoManager.hands[myoId].old_cube_y - window.myoManager.hands[myoId].cube.position.y) > 0.02)
                ) {

            // draw
            // TODO: find a better way to draw... 
            var material = new THREE.MeshBasicMaterial({
                color: 0x15bdde
            });

            var radius = 2;
            var segments = 8;

            var circleGeometry = new THREE.CircleGeometry( radius, segments );              
            var circle = new THREE.Mesh( circleGeometry, material );
            circle.position.set(window.myoManager.hands[myoId].cube.position.x, window.myoManager.hands[myoId].cube.position.y, 0);
            scene.add( circle );
        }

        window.myoManager.hands[myoId].old_cube_x = window.myoManager.hands[myoId].cube.position.x;
        window.myoManager.hands[myoId].old_cube_y = window.myoManager.hands[myoId].cube.position.y;

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
    window.quaternion = new THREE.Quaternion();
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