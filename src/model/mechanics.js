import {Vector, Angle} from "eeg2d"
import WheelModel from "./mechanics/wheel.js"
import CalibratedMechanics from "./mechanics/calibrated.js"
import TranslationMechanics from "./mechanics/translation.js"

const wheelsModel = (calibration) => {
    const model = new WheelModel(calibration);

    model.addWheel("mainWheelAngle", "leftWheelCenter", ["leftWheelCenter", "leftWheelConnectPoint"]);
    model.addWheel("mainWheelAngle", "mainWheelCenter", ["mainWheelCenter", "mainWheelConnectPoint", "returnCrankConnectPoint"]);
    model.addWheel("mainWheelAngle", "rightWheelCenter", ["rightWheelCenter", "rightWheelConnectPoint"]);
    model.addWheel("smallWheelAngle", "smallWheel1Center", ["smallWheel1Center"]);
    model.addWheel("smallWheelAngle", "smallWheel2Center", ["smallWheel2Center"]);

    return model
}

const wheelLinkModel = (calibration) => {
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

const pistonModel = (calibration) => {
    const model = new TranslationMechanics(calibration);

    model.setInput('crossheadConnectPoint');
    model.setOutputs(['pistonCenter', 'pistonUnionLinkConnectPoint']);

    return model
}

const expansionLinkModel = (calibration) => {
    const model = new WheelModel(calibration);

    model.addPointDrivenWheel("expansionLinkConnectPoint", "expansionLinkFixed",
                              ["expansionLinkTopEnd", "expansionLinkBottomEnd", "expansionLinkRadiusCenter"]);
    
    return model
}

const reverseArmModel = (calibration) => {
    const model = new WheelModel(calibration);
    const maxAngle = 1;

    model.addWheelWithLinearAngleCompensation("expansion", Angle.rad(-maxAngle/2), Angle.rad(maxAngle/2), "reverseArmCenter",
                                              ["reverseArmCenter", "reverseArmA", "reverseArmB"]);
    
    return model
}

const reachRodModel = (calibration) => {
    const reachRodMoveDirection = calibration.reachRodEnd.vectorTo(calibration.reverseArmA);
    const model = new CalibratedMechanics(calibration);

    model.addDistanceConstraints([
        ["reachRodEnd", "reverseArmB"],
    ]);

    model.addLineConstraints([
        ['reachRodEnd', reachRodMoveDirection],
    ]);

    model.addInputs(['reverseArmB']);

    model.addOutputs(['reachRodEnd']);

    return model
}

export {wheelsModel, wheelLinkModel, pistonModel, expansionLinkModel, reverseArmModel, reachRodModel}
