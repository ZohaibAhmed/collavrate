# Collavrate - Collaborative WebVR environment using a Myo Armband

Collavrate aims to enable multiple users to collaborate in a VR world. This starts from using a Myo Armband to enable users to draw on a whiteboard. Leveraging the Myo armband, movement in the VR world is controlled by gestures. Furthermore, the project aims to allow users to draw 3D models in VR.

### Setup Process

1. Clone the repository
2. In the root directory, run `npm install`
3. In the server directory, run `npm install`
4. This project uses PostgreSQL, the schema is included in the server directory.
5. Create a config.js in the server directory. It will look something liket this:

```
var config = {
	conString: "postgres://zohaibahmed@localhost/collavrate",
	port: 3000
};

module.exports = config;
```

6. OPTIONAL (if running local server): Run the server from the server directory: `node collavrate.js`
6a. OPTIONAL (if running local server): Make sure you change the SERVER variable in src/collavrate.js
7. OPTIONAL: If you choose to use the myos, please wear both of them and sync them before opening Collavrate.
8. Open vr.html from the root directory

### TODO

- [x] Enable tracking with Myo using Websockets API
- [x] Create primitive whiteboard
- [x] Create more tools to draw shapes, choose colours, etc (Backlogged, not really necessary)
- [x] Create server that would allow multiple clients to connect and draw simultaneously
- [x] Create Oculus environment in THREE.js that allows users to move around
- [x] Create multiple rooms
- [x] Add whiteboards to the VR environment
- [x] Allow users to use two myos at the same time to move and change 3D objects
- [x] Allow users to draw 3D objects by extruding  
- [ ] Add final report and presentation