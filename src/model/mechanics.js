import {Vector} from "eeg2d"
import {MovementMechanics, ConstantMechanics, NamedMechanics, WheelMechanics, ComposedMechanics, InterpolationMechanics} from "./mechanics/constant.js"
import TempModel from "./temp.js"
import {nearestPointOnLine, nearestPointOnArc} from "./geometry.js"
import Mech2dMechanics from "./mechanics/mech2d_new.js"

const valveMovement = MovementMechanics("valveConnectPoint", ["valveCenter"])

const valve = Mech2dMechanics((builder, calibration) => {
    const valveMovement = Vector.create(1, 0)
    const valveMovementPoint = calibration("valveConnectPoint")
    //builder.massCenter(calibration("radiusBarA").interpolate(calibration("combinationLeverA")), "radiusBar")
    builder.massCenter(calibration("expansionLinkRadiusBarConnectPoint"), "radiusBar")
    builder.massCenter(calibration("combinationLeverA").interpolate(calibration("combinationLeverB")), "combinationLever")
    builder.massCenter(calibration("reverseArmA").interpolate(calibration("radiusBarA")), "liftingLine")
    builder.massCenter(calibration("crossheadUnionLinkConnectPoint").interpolate(calibration("combinationLeverB")), "unionLink")
    builder.inputPoint("reverseArmA", "liftingLine")
    builder.inputPoint("crossheadUnionLinkConnectPoint", "unionLink")
    builder.link("liftingLine", "radiusBarA", "radiusBar")
    builder.link("radiusBar", "combinationLeverA", "combinationLever")
    builder.link("combinationLever", "combinationLeverB", "unionLink")
    builder.link("combinationLever", "valveConnectPoint", null, (pt) => nearestPointOnLine(pt, valveMovementPoint, valveMovement))
    builder.link("radiusBar", "expansionLinkRadiusBarConnectPoint", null, (pt, getPoint) => nearestPointOnArc(
        pt,
        getPoint("expansionLinkRadiusCenter"),
        getPoint("expansionLinkBottomEnd"),
        getPoint("expansionLinkTopEnd")
    ))
        
    builder.outputPoint("radiusBarA", "liftingLine")
    builder.outputPoint("combinationLeverA", "combinationLever")
    builder.outputPoint("combinationLeverB", "combinationLever")
    builder.outputPoint("valveConnectPoint", "combinationLever")
    builder.outputPoint("expansionLinkRadiusBarConnectPoint", "radiusBar")
})

const reachRod = InterpolationMechanics("reachRodEndMin", "reachRodEndMax", "reachRodEnd", (model) => (model.param("expansion") + 1) / 2)

const reverseArm = Mech2dMechanics((builder, calibration) => {
    builder.inputPoint("reachRodEnd", "reachRod")
    builder.outputPoint("reverseArmA", "reverseArm")
    builder.outputPoint("reverseArmB", "reverseArm")
    builder.link("reachRod", "reverseArmB", "reverseArm")
    builder.link("reverseArm", "reverseArmFixedPoint", null)
})

const piston = MovementMechanics("crossheadConnectPoint", ["pistonCenter", "crossheadUnionLinkConnectPoint"])

const wheelLink = Mech2dMechanics((builder, calibration) => {
    const crossheadMovementPoint = calibration("crossheadConnectPoint")
    const crossheadMovement = Vector.create(1, 0)
    
    builder.massCenter(calibration("returnCrankConnectPoint").interpolate(calibration("crossheadConnectPoint")), "radiusBar")
    builder.massCenter(calibration("returnCrankConnectPoint").interpolate(calibration("expansionLinkConnectPoint")), "eccentricRod")
    builder.massCenter(calibration("expansionLinkConnectPoint").interpolate(calibration("expansionLinkFixedPoint")), "expansionLink")
    
    builder.inputPoint("returnCrankConnectPoint", "eccentricRod")
    builder.inputPoint("mainWheelConnectPoint", "mainRod")
    builder.outputPoint("expansionLinkConnectPoint", "expansionLink")
    builder.outputPoint("expansionLinkTopEnd", "expansionLink")
    builder.outputPoint("expansionLinkBottomEnd", "expansionLink")
    builder.outputPoint("expansionLinkRadiusCenter", "expansionLink")
    builder.outputPoint("crossheadConnectPoint", "mainRod")
    builder.link("eccentricRod", "expansionLinkConnectPoint", "expansionLink")
    builder.link("expansionLink", "expansionLinkFixedPoint", null)
    builder.link("mainRod", "crossheadConnectPoint", null, (pt) => nearestPointOnLine(pt, crossheadMovementPoint, crossheadMovement))
})

const wheels = ComposedMechanics
    .add(WheelMechanics("mainWheelAngle", "leftWheelCenter", ["leftWheelCenter", "leftWheelConnectPoint"]))
    .add(WheelMechanics("mainWheelAngle", "mainWheelCenter", ["mainWheelCenter", "mainWheelConnectPoint", "returnCrankConnectPoint"]))
    .add(WheelMechanics("mainWheelAngle", "rightWheelCenter", ["rightWheelCenter", "rightWheelConnectPoint"]))
    .add(WheelMechanics("smallWheelAngle", "smallWheel1Center", ["smallWheel1Center"]))
    .add(WheelMechanics("smallWheelAngle", "smallWheel2Center", ["smallWheel2Center"]))
    .create(true)


const fixedPoints = ConstantMechanics([
    "leftWheelCenter", "mainWheelCenter", "rightWheelCenter",
    "smallWheel1Center", "smallWheel2Center",
    "expansionLinkFixedPoint", "reverseArmFixedPoint",
    "reachRodEndMin", "reachRodEndMax"
])

const mainModel = ComposedMechanics
    .add(fixedPoints, "fixedPoints")
    .add(wheels, "wheels")
    .add(wheelLink, "wheelLink")
    .add(piston, "piston")
    .add(reachRod, "reachRod")
    .add(reverseArm, "reverseArm")
    .add(valve, "valve")
    .add(valveMovement, "valveMovement")
    .create()

const temp = (calibration) => {
    return new TempModel(calibration, NamedMechanics("main", mainModel))
}

export default {temp, valveMovement}
