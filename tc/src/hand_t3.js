// Create WebGL scene
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

    var geometry = new THREE.BoxGeometry(150, 150, 50);
    var material = new THREE.MeshPhongMaterial({color: 0x15bdde});
    window.cube = new THREE.Mesh(geometry, material);
    cube.position.set(0,0,0);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);

    renderer.render(scene, camera);
};


// Initiate the MYO
var initMyo = function() {
    "use strict";

	// Create Myo object for device with id 0
	var myMyo = Myo.create(0);

    window.quaternion = new THREE.Quaternion();


	// Events
	myMyo.on('fingers_spread', function(edge){
	    if(!edge) return;
	    console.log("You spread your fingers!")
	});

	myMyo.on('orientation', function(data){
		
		//console.log(data);
		
		window.quaternion.x = data.y;
        window.quaternion.y = data.z;
        window.quaternion.z = -data.x;
        window.quaternion.w = data.w;

 		if(!window.baseRotation) {
            window.baseRotation = quaternion.clone();
            window.baseRotation = window.baseRotation.conjugate();
        }

        window.quaternion.multiply(baseRotation);
        window.quaternion.normalize();
        window.quaternion.z = -quaternion.z;

        window.cube.setRotationFromQuaternion(window.quaternion);

        renderer.render(scene, camera);


	});
};

initScene();
initMyo();


// var log = document.getElementById('log')

// myo.on('pose', function(poseName){
// 	console.log(poseName);
// })

// myo.on('arm_recognized', function(){
// 	console.log('good!', this.id);
// })

// myo.on('arm_lost', function(){
// 	console.log('bad', this.id);
// })

// myo.on('wave_left', function(){
// 	console.log('wave Left!');
// })

// myo.on('fist', function(){
// 	console.log('BT PLZ');
// 	myo.requestBluetoothStrength();
// })

// myo.on('connected', function(){
// 	setInterval(function(){
// 		myo.requestBluetoothStrength();
// 	}, 100);
// })

// myo.on('bluetooth_strength', function(BTS){
// 	var width = ((BTS * -1 - 40 ) / 50 ) * 100  + '%';
// 	$('#log').width(width);
// 	//console.log(width);
// })

// myo.on('double_tap', function(){
// 	this.zeroOrientation();
// 	console.log('double tap') ;
// });

// myo.on('gyroscope', function(data){
// 	if(data.y < -2) console.log(data);
// });