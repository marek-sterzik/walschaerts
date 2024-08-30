import {Point, Vector} from "eeg2d"
import {circleCenterFrom3Points, lineCircleIntersections} from "./geometry.js"

const consts = {
    xSize: 700,
    ySize: 222,
    trackSize: 3,
    xOffset: 4,
    wheelCenterDistance: 149,
    mainWheelRadius: 70,
    smallWheelRadius: 33,
    wheelConnectPointRadius: 30,
    returnCrankConnectPointRadius: 23,
}

const calibration = {}

consts.wheelVOffset = consts.ySize - consts.trackSize - consts.mainWheelRadius
consts.smallWheelVOffset = consts.ySize - consts.trackSize - consts.smallWheelRadius;

calibration.leftWheelCenter = new Point(consts.xOffset + consts.mainWheelRadius, consts.wheelVOffset)

calibration.leftWheelCenter = new Point(consts.xOffset + consts.mainWheelRadius, consts.wheelVOffset)
calibration.mainWheelCenter = new Point(calibration.leftWheelCenter.x + consts.wheelCenterDistance, consts.wheelVOffset)
calibration.rightWheelCenter = new Point(calibration.leftWheelCenter.x + 2*consts.wheelCenterDistance, consts.wheelVOffset)

calibration.smallWheel1Center = new Point(492, consts.smallWheelVOffset)
calibration.smallWheel2Center = new Point(665, consts.smallWheelVOffset)

const v1 = Vector.create(0, 1).mul(consts.wheelConnectPointRadius)
const v2 = Vector.create(1, 0).mul(consts.returnCrankConnectPointRadius)

calibration.leftWheelConnectPoint = calibration.leftWheelCenter.addVector(v1)
calibration.mainWheelConnectPoint = calibration.mainWheelCenter.addVector(v1)
calibration.rightWheelConnectPoint = calibration.rightWheelCenter.addVector(v1)
calibration.returnCrankConnectPoint = calibration.mainWheelCenter.addVector(v2)

calibration.mainWheelConnectPoint = calibration.mainWheelConnectPoint
calibration.returnCrankConnectPoint = calibration.returnCrankConnectPoint
calibration.expansionLinkFixed = new Point(360, 78)
calibration.expansionLinkConnectPoint = new Point(370, 143)
calibration.crossheadConnectPoint = new Point(440, 149)
calibration.pistonCenter = new Point(576, 149)
calibration.pistonUnionLinkConnectPoint = new Point(440, 190)
calibration.expansionLinkTopEnd = new Point(352, 48)
calibration.expansionLinkBottomEnd = new Point(375, 107)

const expansionLinkRange = calibration.expansionLinkFixed.vectorTo(calibration.expansionLinkTopEnd).size()
const bottomRangeVector = calibration.expansionLinkFixed.vectorTo(calibration.expansionLinkBottomEnd).normalize().mul(expansionLinkRange)

calibration.expansionLinkBottomEnd = calibration.expansionLinkFixed.addVector(bottomRangeVector)

calibration.expansionLinkRadiusCenter = circleCenterFrom3Points(
    calibration.expansionLinkTopEnd,
    calibration.expansionLinkFixed,
    calibration.expansionLinkBottomEnd
)

calibration.reverseArmCenter = new Point(378, 38)
calibration.reverseArmA = new Point(340, 65)
calibration.reverseArmB = new Point(394, 65)

calibration.reachRodEnd = new Point(230, 58)

calibration.radiusBarA = new Point(349, 104)
calibration.combinationLeverA = new Point(496, 76)
calibration.combinationLeverB = new Point(487, 183)
calibration.valveCenter = new Point(586, 89)

const valveConnectPointRatio = (calibration.valveCenter.y - calibration.combinationLeverA.y) /
                               (calibration.combinationLeverB.y - calibration.combinationLeverA.y)

const combinationLeverVector = calibration.combinationLeverA.vectorTo(calibration.combinationLeverB)

calibration.valveConnectPoint = calibration.combinationLeverA.addVector(combinationLeverVector.mul(valveConnectPointRatio))

const intersections = lineCircleIntersections(
    calibration.radiusBarA,
    calibration.radiusBarA.vectorTo(calibration.combinationLeverA),
    calibration.expansionLinkRadiusCenter,
    calibration.expansionLinkRadiusCenter.vectorTo(calibration.expansionLinkFixed).size()
)

calibration.expansionLinkRadiusRod = intersections[0]

Object.freeze(calibration)
Object.freeze(consts)

export {calibration, consts}
