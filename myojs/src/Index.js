/**
 * Myo is the global namespace of the Myo API.
 * @namespace Myo
 */
module.exports = {
    Hub: require("./Hub"),
    Myo: require("./Myo"),
    CircularBuffer: require("./CircularBuffer"),
    Pose: require("./Pose"),
    Quaternion: require("./Quaternion"),
    Vector3: require("./Vector3"),
    Frame: require("./Frame"),
    Version: require('./Version.js')
};