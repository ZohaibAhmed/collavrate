// Create Myo object for device with id 0
var myMyo = Myo.create(0);

myMyo.on('fingers_spread', function(edge){
    if(!edge) return;
    console.log("You spread your fingers!")
});

myMyo.on('orientation', function(data){
	console.log(data.x);
});

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