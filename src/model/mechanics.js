import {Vector, Angle} from "eeg2d"
import WheelModel from "./mechanics/wheel.js"
import CalibratedMechanics from "./mechanics/calibrated.js"
import TranslationMechanics from "./mechanics/translation.js"
import ConstantMechanics from "./mechanics/constant.js"
import InterpolateModel from "./mechanics/interpolate.js"
import Mech2dModel from "./mechanics/mech2d.js"

const fixedPointsModel = (calibration) => {
    const model = new ConstantMechanics(calibration)
    model.addPoints(["leftWheelCenter", "mainWheelCenter", "rightWheelCenter"])
    model.addPoints(["smallWheel1Center", "smallWheel2Center"])
    model.addPoints(["expansionLinkFixedPoint", "reverseArmFixedPoint"])
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
        ["expansionLinkConnectPoint", "expansionLinkFixedPoint"],
        ["mainWheelConnectPoint", "crossheadConnectPoint"]
    ])

    model.addLineConstraints([
        ['crossheadConnectPoint', pistonMoveDirection],
        ['pistonCenter', pistonMoveDirection]
    ])

    model.addFixedPointConstraints(['expansionLinkFixedPoint'])

    model.addInputs(['returnCrankConnectPoint', 'mainWheelConnectPoint'])

    model.addOutputs([
        'expansionLinkConnectPoint',
        'crossheadConnectPoint',
    ])
    return model
}

/*
const wheelLinkModel = (calibration) => {
    const model = new Mech2dModel(calibration)
    model.inputPoint("returnCrankConnectPoint", "eccentricRod")
    model.outputPoint("expansionLinkConnectPoint", "expansionLink")
    model.outputPoint("expansionLinkTopEnd", "expansionLink")
    model.outputPoint("expansionLinkBottomEnd", "expansionLink")
    model.outputPoint("expansionLinkRadiusCenter", "expansionLink")
    model.link("eccentricRod", "expansionLinkConnectPoint", "expansionLink")
    model.link("expansionLink", "expansionLinkFixedPoint", null)
    return model
}
*/

const pistonModel = (calibration) => {
    const model = new TranslationMechanics(calibration)

    model.setInput('crossheadConnectPoint')
    model.setOutputs(['pistonCenter', 'crossheadUnionLinkConnectPoint'])

    return model
}

const expansionLinkModel = (calibration) => {
    const model = new WheelModel(calibration)

    model.addPointDrivenWheel("expansionLinkConnectPoint", "expansionLinkFixedPoint",
                              ["expansionLinkTopEnd", "expansionLinkBottomEnd", "expansionLinkRadiusCenter"])
    
    return model
}

const reverseArmModel = (calibration) => {
    const model = new Mech2dModel(calibration)
    model.inputPoint("reachRodEnd", "reachRod")
    model.outputPoint("reverseArmA", "reverseArm")
    model.outputPoint("reverseArmB", "reverseArm")
    model.link("reachRod", "reverseArmB", "reverseArm")
    model.link("reverseArm", "reverseArmFixedPoint", null)
    return model
}

const reachRodModel = (calibration) => {
    const model = new InterpolateModel(calibration)
    model.addInterpolation("reachRodEndMin", "reachRodEndMax", "reachRodEnd", (params) => (params.expansion + 1) / 2)
    return model
}

const nearestPointOnLine = (point, linePoint, lineVector) => {
    const ortho = lineVector.rot(Angle.right()).normalize()
    return point.addVector(ortho.mul(point.vectorTo(linePoint).mul(ortho)))
}

const valveModel = (calibration) => {
    const valveMovement = Vector.create(1, 0)
    const valveMovementPoint = calibration.valveConnectPoint
    const model = new Mech2dModel(calibration)
    model.massCenter(calibration.radiusBarA.interpolate(calibration.combinationLeverA), "radiusBar")
    model.massCenter(calibration.combinationLeverA.interpolate(calibration.combinationLeverB), "combinationLever")
    model.massCenter(calibration.reverseArmA.interpolate(calibration.radiusBarA), "liftingLine")
    model.massCenter(calibration.crossheadUnionLinkConnectPoint.interpolate(calibration.combinationLeverB), "unionLink")
    model.inputPoint("reverseArmA", "liftingLine")
    model.inputPoint("crossheadUnionLinkConnectPoint", "unionLink")
    model.link("liftingLine", "radiusBarA", "radiusBar")
    model.link("radiusBar", "combinationLeverA", "combinationLever")
    model.link("combinationLever", "combinationLeverB", "unionLink")
    model.link("combinationLever", "valveConnectPoint", null, (pt) => nearestPointOnLine(pt, valveMovementPoint, valveMovement))
        
    model.outputPoint("radiusBarA", "liftingLine")
    model.outputPoint("combinationLeverA", "combinationLever")
    model.outputPoint("combinationLeverB", "combinationLever")
    model.outputPoint("valveConnectPoint", "combinationLever")
    return model
}

const valveMovementModel = (calibration) => {
    const model = new TranslationMechanics(calibration)

    model.setInput('valveConnectPoint')
    model.setOutputs(['valveCenter'])

    return model
}

export {fixedPointsModel, wheelsModel, wheelLinkModel, pistonModel, expansionLinkModel, reverseArmModel, reachRodModel, valveModel, valveMovementModel}
