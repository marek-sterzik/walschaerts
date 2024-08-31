import {Vector, Angle} from "eeg2d"
import WheelModel from "./mechanics/wheel.js"
import CalibratedMechanics from "./mechanics/calibrated.js"
import TranslationMechanics from "./mechanics/translation.js"
import ConstantMechanics from "./mechanics/constant.js"
import InterpolateModel from "./mechanics/interpolate.js"
import Mech2dModel from "./mechanics/mech2d.js"

const wheelCenterModel = (calibration) => {
    const model = new ConstantMechanics(calibration)
    model.addPoints(["leftWheelCenter", "mainWheelCenter", "rightWheelCenter"])
    model.addPoints(["smallWheel1Center", "smallWheel2Center"])
    return model
}

const wheelsModel = (calibration) => {
    const model = new WheelModel(calibration)

    model.addWheel("mainWheelAngle", "leftWheelCenter", ["leftWheelCenter", "leftWheelConnectPoint"])
    model.addWheel("mainWheelAngle", "mainWheelCenter", ["mainWheelCenter", "mainWheelConnectPoint", "returnCrankConnectPoint"])
    model.addWheel("mainWheelAngle", "rightWheelCenter", ["rightWheelCenter", "rightWheelConnectPoint"])
    model.addWheel("smallWheelAngle", "smallWheel1Center", ["smallWheel1Center"])
    model.addWheel("smallWheelAngle", "smallWheel2Center", ["smallWheel2Center"])

    return model
}

const wheelLinkModel = (calibration) => {
    const pistonMoveDirection = new Vector(1, 0)

    const model = new CalibratedMechanics(calibration)

    model.addDistanceConstraints([
        ["returnCrankConnectPoint", "expansionLinkConnectPoint"],
        ["expansionLinkConnectPoint", "expansionLinkFixed"],
        ["mainWheelConnectPoint", "crossheadConnectPoint"]
    ])

    model.addLineConstraints([
        ['crossheadConnectPoint', pistonMoveDirection],
        ['pistonCenter', pistonMoveDirection]
    ])

    model.addFixedPointConstraints(['expansionLinkFixed'])

    model.addInputs(['returnCrankConnectPoint', 'mainWheelConnectPoint'])

    model.addOutputs([
        'expansionLinkFixed',
        'expansionLinkConnectPoint',
        'crossheadConnectPoint',
        'pistonCenter',
        'pistonUnionLinkConnectPoint',
    ])
    return model
}

const pistonModel = (calibration) => {
    const model = new TranslationMechanics(calibration)

    model.setInput('crossheadConnectPoint')
    model.setOutputs(['pistonCenter', 'pistonUnionLinkConnectPoint'])

    return model
}

const expansionLinkModel = (calibration) => {
    const model = new WheelModel(calibration)

    model.addPointDrivenWheel("expansionLinkConnectPoint", "expansionLinkFixed",
                              ["expansionLinkTopEnd", "expansionLinkBottomEnd", "expansionLinkRadiusCenter"])
    
    return model
}

const reverseArmModel = (calibration) => {
    const model = new WheelModel(calibration)
    const maxAngle = 1

    model.addWheelWithLinearAngleCompensation("expansion", Angle.rad(-maxAngle/2), Angle.rad(maxAngle/2), "reverseArmCenter",
                                              ["reverseArmCenter", "reverseArmA", "reverseArmB"])
    
    return model
}
/*
const reverseArmModel = (calibration) => {
    const model = new Mech2dModel(calibration)
    model.inputPoint("reachRodEnd", "reachRod")
    model.outputPoint("reverseArmA", "reverseArm")
    model.outputPoint("reverseArmB", "reverseArm")
    model.outputPoint("reverseArmCenter", "reverseArm")
    model.link("reachRod", "reverseArmB", "reverseArm")
    model.link("reverseArm", "reverseArmCenter", null)
    return model
}
*/

const reachRodModel = (calibration) => {
    const model = new InterpolateModel(calibration)
    model.addInterpolation("reachRodEndMin", "reachRodEndMax", "reachRodEnd", (params) => (params.expansion + 1) / 2)
    return model
}

export {wheelCenterModel, wheelsModel, wheelLinkModel, pistonModel, expansionLinkModel, reverseArmModel, reachRodModel}
