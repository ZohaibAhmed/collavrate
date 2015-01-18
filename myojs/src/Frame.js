var Hub = require("./Hub"),
    Myo = require("./Myo"),
    Pose = require("./Pose"),
    Quaternion = require("./Quaternion"),
    Vector3 = require("./Vector3"),
    _ = require("underscore");

var Frame = module.exports = function (data) {
    /**
     * A unique ID for this Frame. Consecutive frames processed by the Myo
     * have consecutive increasing values.
     * @member id
     * @memberof Myo.Frame.prototype
     * @type {number}
     */
    this.id = data.id;

    /**
     * The frame capture time in microseconds elapsed since the Myo started.
     * @member timestamp
     * @memberof Myo.Frame.prototype
     * @type {number}
     */
    this.timestamp = data.timestamp;

    if (data["euler"]) {
        this.euler = data["euler"];
    }

    /**
     * A change in pose has been detected.
     * @member pose
     * @memberof Myo.Pose.prototype
     * @type {Pose}
     */
    if (data["pose"]) {
        this.pose = new Pose(data["pose"]);
    } else {
        this.pose = Pose.invalid();
    }

    /**
     * A change in pose has been detected.
     * @member pose
     * @memberof Myo.Pose.prototype
     * @type {Pose}
     */
    if (data["rotation"]) {
        this.rotation = new Quaternion(data["rotation"]);
    } else {
        this.rotation = Quaternion.invalid();
    }

    if (data["accel"]) {
        this.accel = new Vector3(data["accel"]);
    } else {
        this.accel = Vector3.invalid();
    }

    if (data["gyro"]) {
        this.gyro = new Vector3(data["gyro"]);
    } else {
        this.gyro = Vector3.invalid();
    }

    /**
     * EMG data
     */
    if (data["emg"]) {
        this.emg = data["emg"];
    } else {
        this.emg = [];
    }

    this.data = data;
    this.type = "frame";
};


/**
 * Returns a string containing this Frame in a human readable format.
 * @return
 *
 */
Frame.prototype.toString = function () {
    return "[Frame id:" + this.id + " timestamp:" + this.timestamp + " accel:" + this.accel.toString() + "]";
};