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
    var geometry = new THREE.BoxGeometry(12, 12, 12);
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
    var SecMyo = Myo.create(1);
    SecMyo.on('position', function(x, y, thetha) {
        console.log("second one");
    });

    // myMyo.unlock();
    myMyo.on('position', function(x, y, theta){
        //console.log(x * 100);

        // translate the shape to x, y
        x = x * 300;
        y = y * 300;

        

        if (window.initialize_myo == false) {
            window.pos_x = x;
            window.pos_y = y;
            window.initialize_myo = true;
        } else {
            // only run this chunk of code every 20 ms

            if (Date.now() > window.updated_time + 0) {
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
                // TODO: find a better way to draw... 
                var material = new THREE.MeshBasicMaterial({
                    color: 0x15bdde
                });

                var radius = 2;
                var segments = 32;

                var circleGeometry = new THREE.CircleGeometry( radius, segments );              
                var circle = new THREE.Mesh( circleGeometry, material );
                circle.position.set(window.cube.position.x, window.cube.position.y, 0);
                scene.add( circle );

                renderer.render(scene, camera);
                window.updated_time = Date.now();
            }
        };       
    });
};
initScene();
initMyo();