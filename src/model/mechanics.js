import {Vector, Angle} from "eeg2d"
import WheelModel from "./mechanics/wheel.js"
import CalibratedMechanics from "./mechanics/calibrated.js"
import TranslationMechanics from "./mechanics/translation.js"
import ConstantMechanics from "./mechanics/constant.js"
import InterpolateModel from "./mechanics/interpolate.js"
import UnionModel from "./mechanics/union.js"
import Mech2dModel from "./mechanics/mech2d.js"
import CallbackModel from "./mechanics/callback.js"
import {nearestPointOnLine, nearestPointOnArc} from "./geometry.js"

const fixedPoints = (calibration) => {
    const model = new ConstantMechanics(calibration)
    model.addPoints(["leftWheelCenter", "mainWheelCenter", "rightWheelCenter"])
    model.addPoints(["smallWheel1Center", "smallWheel2Center"])
    model.addPoints(["expansionLinkFixedPoint", "reverseArmFixedPoint"])
    return model
}

const wheels = (calibration) => {
    const model = new WheelModel(calibration)

    model.addWheel("mainWheelAngle", "leftWheelCenter", ["leftWheelCenter", "leftWheelConnectPoint"])
    model.addWheel("mainWheelAngle", "mainWheelCenter", ["mainWheelCenter", "mainWheelConnectPoint", "returnCrankConnectPoint"])
    model.addWheel("mainWheelAngle", "rightWheelCenter", ["rightWheelCenter", "rightWheelConnectPoint"])
    model.addWheel("smallWheelAngle", "smallWheel1Center", ["smallWheel1Center"])
    model.addWheel("smallWheelAngle", "smallWheel2Center", ["smallWheel2Center"])

    return model
}

/*
const wheelLink = (calibration) => {
    const pistonMoveDirection = new Vector(1, 0)

    const model1 = new CalibratedMechanics(calibration)

    model1.addDistanceConstraints([
        ["returnCrankConnectPoint", "expansionLinkConnectPoint"],
        ["expansionLinkConnectPoint", "expansionLinkFixedPoint"],
        ["mainWheelConnectPoint", "crossheadConnectPoint"]
    ])

    model1.addLineConstraints([
        ['crossheadConnectPoint', pistonMoveDirection],
        ['pistonCenter', pistonMoveDirection]
    ])

    model1.addFixedPointConstraints(['expansionLinkFixedPoint'])

    model1.addInputs(['returnCrankConnectPoint', 'mainWheelConnectPoint'])

    model1.addOutputs([
        'expansionLinkConnectPoint',
        'crossheadConnectPoint',
    ])

    const model2 = new WheelModel(calibration)

    model2.addPointDrivenWheel("expansionLinkConnectPoint", "expansionLinkFixedPoint",
                              ["expansionLinkTopEnd", "expansionLinkBottomEnd", "expansionLinkRadiusCenter"])
    
    return new UnionModel([model1, model2])
}
*/

const wheelLink = (calibration) => {
    const crossheadMovementPoint = calibration.crossheadConnectPoint
    const crossheadMovement = Vector.create(1, 0)
    const model = new Mech2dModel(calibration)
    model.massCenter(calibration.returnCrankConnectPoint.interpolate(calibration.crossheadConnectPoint), "radiusBar")
    model.massCenter(calibration.returnCrankConnectPoint.interpolate(calibration.expansionLinkConnectPoint), "eccentricRod")
    model.massCenter(calibration.expansionLinkConnectPoint.interpolate(calibration.expansionLinkFixedPoint), "expansionLink")
    model.inputPoint("returnCrankConnectPoint", "eccentricRod")
    model.inputPoint("mainWheelConnectPoint", "mainRod")
    model.outputPoint("expansionLinkConnectPoint", "expansionLink")
    model.outputPoint("expansionLinkTopEnd", "expansionLink")
    model.outputPoint("expansionLinkBottomEnd", "expansionLink")
    model.outputPoint("expansionLinkRadiusCenter", "expansionLink")
    model.outputPoint("crossheadConnectPoint", "mainRod")
    model.link("eccentricRod", "expansionLinkConnectPoint", "expansionLink")
    model.link("expansionLink", "expansionLinkFixedPoint", null)
    model.link("mainRod", "crossheadConnectPoint", null, (pt) => nearestPointOnLine(pt, crossheadMovementPoint, crossheadMovement))
    return model
}


const piston = (calibration) => {
    const model = new TranslationMechanics(calibration)

    model.setInput('crossheadConnectPoint')
    model.setOutputs(['pistonCenter', 'crossheadUnionLinkConnectPoint'])

    return model
}

const reverseArm = (calibration) => {
    const model = new Mech2dModel(calibration)
    model.inputPoint("reachRodEnd", "reachRod")
    model.outputPoint("reverseArmA", "reverseArm")
    model.outputPoint("reverseArmB", "reverseArm")
    model.link("reachRod", "reverseArmB", "reverseArm")
    model.link("reverseArm", "reverseArmFixedPoint", null)
    return model
}

const reachRod = (calibration) => {
    const model = new InterpolateModel(calibration)
    model.addInterpolation("reachRodEndMin", "reachRodEndMax", "reachRodEnd", (params) => (params.expansion + 1) / 2)
    return model
}

const valve = (calibration) => {
    const valveMovement = Vector.create(1, 0)
    const valveMovementPoint = calibration.valveConnectPoint
    const model = new Mech2dModel(calibration)
    //model.massCenter(calibration.radiusBarA.interpolate(calibration.combinationLeverA), "radiusBar")
    model.massCenter(calibration.expansionLinkRadiusBarConnectPoint, "radiusBar")
    model.massCenter(calibration.combinationLeverA.interpolate(calibration.combinationLeverB), "combinationLever")
    model.massCenter(calibration.reverseArmA.interpolate(calibration.radiusBarA), "liftingLine")
    model.massCenter(calibration.crossheadUnionLinkConnectPoint.interpolate(calibration.combinationLeverB), "unionLink")
    model.inputPoint("reverseArmA", "liftingLine")
    model.inputPoint("crossheadUnionLinkConnectPoint", "unionLink")
    model.link("liftingLine", "radiusBarA", "radiusBar")
    model.link("radiusBar", "combinationLeverA", "combinationLever")
    model.link("combinationLever", "combinationLeverB", "unionLink")
    model.link("combinationLever", "valveConnectPoint", null, (pt) => nearestPointOnLine(pt, valveMovementPoint, valveMovement))
    model.link("radiusBar", "expansionLinkRadiusBarConnectPoint", null, (pt, getPoint) => nearestPointOnArc(
        pt,
        getPoint("expansionLinkRadiusCenter"),
        getPoint("expansionLinkBottomEnd"),
        getPoint("expansionLinkTopEnd")
    ))
        
    model.outputPoint("radiusBarA", "liftingLine")
    model.outputPoint("combinationLeverA", "combinationLever")
    model.outputPoint("combinationLeverB", "combinationLever")
    model.outputPoint("valveConnectPoint", "combinationLever")
    model.outputPoint("expansionLinkRadiusBarConnectPoint", "radiusBar")

    return model
}

const valveMovement = (calibration) => {
    const model = new TranslationMechanics(calibration)

    model.setInput('valveConnectPoint')
    model.setOutputs(['valveCenter'])

    return model
}

export default {fixedPoints, wheels, wheelLink, piston, reverseArm, reachRod, valve, valveMovement}
