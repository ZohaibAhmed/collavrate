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

    var geometry = new THREE.BoxGeometry(25, 25, 150);
    var material = new THREE.MeshPhongMaterial({color: 0x15bdde});
    window.cube = new THREE.Mesh(geometry, material);

    window.pos_x = 50;
    window.pos_y = 0;
    window.pos_z = 0;

    cube.position.set(window.pos_x, window.pos_y, window.pos_z);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);

    renderer.render(scene, camera);
};

var initMyo = function() {
    "use strict";

    window.hub = new Myo.Hub();

    window.quaternion = new THREE.Quaternion();

    window.hub.on('ready', function() {
        console.log("ready");
    });

    window.hub.on('connect', function() {
        console.log("connected");
    });

    window.hub.on('disconnect', function() {
        console.log("disconnect");
    });

    window.hub.on('frame', function(frame) {

        console.log(frame);

        window.quaternion.x = frame.rotation.y;
        window.quaternion.y = frame.rotation.z;
        window.quaternion.z = -frame.rotation.x;
        window.quaternion.w = frame.rotation.w;

        if(!window.baseRotation) {
            window.baseRotation = quaternion.clone();
            window.baseRotation = window.baseRotation.conjugate();
        }

        window.quaternion.multiply(baseRotation);
        window.quaternion.normalize();
        window.quaternion.z = quaternion.z;

        window.cube.setRotationFromQuaternion(window.quaternion);

        renderer.render(scene, camera);
    });
};
initScene();
initMyo();