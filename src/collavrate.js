var radius = 0;
var demo = Sketch.create({
    container: document.getElementById('container'),
    autoclear: false
});

demo.setup = function() {
    console.log("setup");
}

demo.update = function() {
    radius = 2 + abs( sin( this.millis * 0.003 ) * 50 );
}

demo.mousemove =  function() {
    for ( var i = this.touches.length - 1, touch; i >= 0; i-- ) {
        touch = this.touches[i];
        this.lineCap = 'round';
        this.lineJoin = 'round';
        console.log("down");
        this.fillStyle = this.strokeStyle = "#000";
        this.lineWidth = 10;
        this.beginPath();
        this.moveTo( touch.ox, touch.oy );
        this.lineTo( touch.x, touch.y );
        this.stroke();
    }
}

// demo.draw = function(x, y) {
//     this.lineCap = 'round';
//     this.lineJoin = 'round';
//     console.log("down");
//     this.fillStyle = this.strokeStyle = "#000";
//     this.lineWidth = 10;
//     this.beginPath();
//     this.moveTo( x, y );
//     this.lineTo( x, y );
//     this.stroke();
// }

var myoX = 0, myoY = 0, myoZ = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

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
    //BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments)
    //CylinderGeometry(radiusTop, radiusBottom, height, radiusSegments, heightSegments, openEnded)
    var geometry = new THREE.BoxGeometry(25, 25, 25);
    //var geometry = new THREE.CylinderGeometry( 0, 25, 150, 32 );
    var material = new THREE.MeshPhongMaterial({color: 0x15bdde});
    window.cube = new THREE.Mesh(geometry, material);

    window.pos_x = 0;
    window.pos_y = 0;
    window.pos_z = 0;
    window.initialize_myo = false;
    window.updated_time = Date.now();

    window.cube.rotation.x = -0.5*Math.PI;
    cube.position.set(window.pos_x, window.pos_y, window.pos_z);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);
    scene.add(new THREE.AxisHelper(50));
    scene.add(new THREE.GridHelper(10,5));

    renderer.render(scene, camera);
};

var initMyo = function() {
    window.quaternion = new THREE.Quaternion();

    var myMyo = Myo.create(0);
    // myMyo.unlock();
    myMyo.on('position', function(x, y, theta){

        // translate the shape to x, y
        x = x * 300;
        y = y * 300;

        

        if (window.initialize_myo == false) {
            window.pos_x = x;
            window.pos_y = y;
            window.initialize_myo = true;
        } else {
            // only run this chunk of code every 20 ms

            if (Date.now() > window.updated_time + 20) {
                // we need to translate x, y by the displacement
                var displacement_x = -(window.pos_x - x);
                var displacement_y = -(window.pos_y - y);

                if (window.cube.position.x < 100 && window.cube.position.x > -100) {
                    window.cube.translateX(displacement_x);
                } else {
                    if (displacement_x < 0 && window.cube.position.x >= 100) {
                        window.cube.translateX(displacement_x);
                    } else if (displacement_x > 0 && window.cube.position.x <= -100) {
                        window.cube.translateX(displacement_x);
                    }
                }
                if (window.cube.position.y < 100 && window.cube.position.y > -100) {
                    window.cube.translateZ(displacement_y);
                } else {
                    if (displacement_y < 0 && window.cube.position.y >= 100) {
                        window.cube.translateZ(displacement_y);
                    } else if (displacement_y > 0 && window.cube.position.y <= -100) {
                        window.cube.translateZ(displacement_y);
                    }
                }
                
                window.pos_x = x;
                window.pos_y = y;

                // draw
                //demo.draw(window.cube.position.x, window.cube.position.y);

                renderer.render(scene, camera);
                window.updated_time = Date.now();
            }
        };       
    });

    // window.hub.on('frame', function(frame) {

    //     console.log(frame);

    //     window.quaternion.x = frame.rotation.y;
    //     window.quaternion.y = frame.rotation.z;
    //     window.quaternion.z = -frame.rotation.x;
    //     window.quaternion.w = frame.rotation.w;

    //     if(!window.baseRotation) {
    //         window.baseRotation = quaternion.clone();
    //         window.baseRotation = window.baseRotation.conjugate();
    //     }

    //     window.quaternion.multiply(baseRotation);
    //     window.quaternion.normalize();
    //     window.quaternion.z = quaternion.z;

    //     if (window.pos_x == 0) {
    //         window.pos_x = frame.accel.x * 100;
    //     }
    //     if (window.pos_y == 0) {
    //         window.pos_y = frame.accel.y * 100;
    //     }
    //     if (window.pos_z == 0) {
    //         window.pos_z = frame.accel.z * 100;
    //     }

    //     myoX = ( (frame.euler.pitch * 100) );
    //     myoY = ( (frame.euler.yaw * 100));
    //     myoZ = ( (frame.euler.roll * 500));

    //     console.log("x is " + myoX);

    //     // calculate the displacement
    //     // var displacement_x = window.pos_x - (frame.accel.x * 100);
    //     // var displacement_y = window.pos_y - (frame.accel.y * 100);
    //     // var displacement_z = window.pos_z - (frame.accel.z * 100);

    //     // //window.cube.setRotationFromQuaternion(window.quaternion);
    //     // // window.cube.set(frame.accel.x, frame.accel.y, frame.accel.z, frame.rotation.w)
        
    //     // if (displacement_x > 1) {
    //     //     window.cube.translateX(window.pos_x + displacement_x);
    //     // }
    //     // if (displacement_y > 1) {
    //     //     window.cube.translateY(window.pos_y + displacement_y);
    //     // }
    //     // if (displacement_z > 1) {
    //     //     window.cube.translateZ(window.pos_z + displacement_z);
    //     // }
        

    //     // window.pos_x = frame.accel.x;
    //     // window.pos_y = frame.accel.y;
    //     // window.pos_z = frame.accel.z;

    //     renderer.render(scene, camera);
    // });
};
initScene();
initMyo();