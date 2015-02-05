// TO LOAD THIS, YOU MUST FOLLOW THIS: https://github.com/mrdoob/three.js/wiki/How-to-run-things-locally

var container, scene, renderer, camera, light, loader;
var WIDTH, HEIGHT, VIEW_ANGLE, ASPECT, NEAR, FAR;

container = document.querySelector('.viewport');

WIDTH = window.innerWidth;
HEIGHT = window.innerHeight;

VIEW_ANGLE = 45;
ASPECT = WIDTH / HEIGHT;
NEAR = 1;
FAR = 10000;

// Setup scene
scene = new THREE.Scene();

renderer = new THREE.WebGLRenderer({antialias: true});

renderer.setSize(WIDTH, HEIGHT);
renderer.shadowMapEnabled = true;
renderer.shadowMapSoft = true;
renderer.shadowMapType = THREE.PCFShadowMap;
renderer.shadowMapAutoUpdate = true;

container.appendChild(renderer.domElement);

camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);

camera.position.set(30, 10, 0);
camera.lookAt(scene.position);
camera.lookAt(scene.position);
scene.add(camera);

light = new THREE.DirectionalLight(0xffffff);

light.position.set(0, 300, 0);
light.castShadow = true;
light.shadowCameraLeft = -60;
light.shadowCameraTop = -60;
light.shadowCameraRight = 60;
light.shadowCameraBottom = 60;
light.shadowCameraNear = 1;
light.shadowCameraFar = 1000;
light.shadowBias = -0.0001;
light.shadowMapWidth = light.shadowMapHeight = 1024;
light.shadowDarkness = 0.7;

scene.add(light);

var loader = new THREE.JSONLoader();

// Load model
loader.load('file:///Users/zohaibahmed/Documents/uni/csc492/src/models/hand_rig.js', function (geometry, materials) {
  var hand, material;

  hand = new THREE.SkinnedMesh(
    geometry,
    new THREE.MeshFaceMaterial(materials)
  );

  material = hand.material.materials;

  for (var i = 0; i < materials.length; i++) {
    var mat = materials[i];

    mat.skinning = true;
  }

  hand.castShadow = true;
  hand.receiveShadow = true;

  // hand should be pointing up...
  // this means that we are rotating -90 degrees on the z-axis
  hand.rotation.set(0, 0, -90 * Math.PI/180);

  window.hand = hand;
  scene.add(window.hand);

  render();
});

function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

function changeFingerPosition(boneNumber) {
  var bones = window.hand.skeleton.bones,
      pinky = window.hand.skeleton.bones[boneNumber],
      phalanges;

  phalanges = [bones[boneNumber + 1], bones[boneNumber + 2]];

  // move everything 90 degrees for starts
  pinky.rotation.set(0, 0, 90 * Math.PI/180);

  for (var i = 0, length = phalanges.length; i < length; i++) {
    phalanges[i].rotation.set(0, 0, 90 * Math.PI/180);
  }
}