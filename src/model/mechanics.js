import {Vector} from "eeg2d"
import Components from "./components.js"
import {nearestPointOnLine, nearestPointOnArc} from "./geometry.js"

const valveMovement = Components.Movement("valveConnectPoint", ["valveCenter"])

const valve = Components.Mech2d((builder, calibration) => {
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

const reachRod = Components.Interpolation("reachRodEndMin", "reachRodEndMax", "reachRodEnd", (model) => (model.param("expansion") + 1) / 2)

const reverseArm = Components.Mech2d((builder, calibration) => {
    builder.inputPoint("reachRodEnd", "reachRod")
    builder.outputPoint("reverseArmA", "reverseArm")
    builder.outputPoint("reverseArmB", "reverseArm")
    builder.link("reachRod", "reverseArmB", "reverseArm")
    builder.link("reverseArm", "reverseArmFixedPoint", null)
})

const piston = Components.Movement("crossheadConnectPoint", ["pistonCenter", "crossheadUnionLinkConnectPoint"])

const wheelLink = Components.Mech2d((builder, calibration) => {
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

const wheels = Components.Compose
    .add(Components.Wheel("mainWheelAngle", "leftWheelCenter", ["leftWheelCenter", "leftWheelConnectPoint"]))
    .add(Components.Wheel("mainWheelAngle", "mainWheelCenter", ["mainWheelCenter", "mainWheelConnectPoint", "returnCrankConnectPoint"]))
    .add(Components.Wheel("mainWheelAngle", "rightWheelCenter", ["rightWheelCenter", "rightWheelConnectPoint"]))
    .add(Components.Wheel("smallWheelAngle", "smallWheel1Center", ["smallWheel1Center"]))
    .add(Components.Wheel("smallWheelAngle", "smallWheel2Center", ["smallWheel2Center"]))
    .create(true)


const fixedPoints = Components.Constant([
    "leftWheelCenter", "mainWheelCenter", "rightWheelCenter",
    "smallWheel1Center", "smallWheel2Center",
    "expansionLinkFixedPoint", "reverseArmFixedPoint",
    "reachRodEndMin", "reachRodEndMax"
])

const mainModel = Components.Name("main", Components.Compose
    .add(fixedPoints, "fixedPoints")
    .add(wheels, "wheels")
    .add(wheelLink, "wheelLink")
    .add(piston, "piston")
    .add(reachRod, "reachRod")
    .add(reverseArm, "reverseArm")
    .add(valve, "valve")
    .add(valveMovement, "valveMovement")
    .create()
)

export default mainModel
