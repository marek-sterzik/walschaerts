import {Vector} from "eeg2d"
import WheelModel from "./mechanics/wheel.js"
import CalibratedMechanics from "./mechanics/calibrated.js"

const wheelsModel = (calibration) => {
    const model = new WheelModel(calibration);

    model.addWheel("mainWheelAngle", "leftWheelCenter", ["leftWheelCenter", "leftWheelConnectPoint"]);
    model.addWheel("mainWheelAngle", "mainWheelCenter", ["mainWheelCenter", "mainWheelConnectPoint", "returnCrankConnectPoint"]);
    model.addWheel("mainWheelAngle", "rightWheelCenter", ["rightWheelCenter", "rightWheelConnectPoint"]);
    model.addWheel("smallWheelAngle", "smallWheel1Center", ["smallWheel1Center"]);
    model.addWheel("smallWheelAngle", "smallWheel2Center", ["smallWheel2Center"]);

    return model
}

const expansionLinkModel = (calibration) => {
    const pistonMoveDirection = new Vector(1, 0);

    const model = new CalibratedMechanics(calibration);

    model.addDistanceConstraints([
        ["returnCrankConnectPoint", "expansionLinkConnectPoint"],
        ["expansionLinkConnectPoint", "expansionLinkFixed"],
        ["mainWheelConnectPoint", "crossheadConnectPoint"]
    ]);

    model.addLineConstraints([
        ['crossheadConnectPoint', pistonMoveDirection],
        ['pistonCenter', pistonMoveDirection]
    ]);

    model.addFixedPointConstraints(['expansionLinkFixed']);

    model.addInputs(['returnCrankConnectPoint', 'mainWheelConnectPoint']);

    model.addOutputs([
        'expansionLinkFixed',
        'expansionLinkConnectPoint',
        'crossheadConnectPoint',
        'pistonCenter',
        'pistonUnionLinkConnectPoint',
    ]);
    return model
}

export {wheelsModel, expansionLinkModel}
