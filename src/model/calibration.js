import {Point, Vector, Transformation} from "eeg2d"
import {circleCenterFrom3Points, lineCircleIntersections} from "./geometry.js"
import loadPointsFromSvg from "./svg.js"

const createCalibrationData = (svg) => {
    const points = loadPointsFromSvg(svg)
    
    const consts = {
        xSize: points.page.x,
        ySize: points.page.y,
        mainWheelRadius: points.mainWheelCenter.vectorTo(points.mainWheelRail).size(),
        smallWheelRadius: points.smallWheel1Center.vectorTo(points.smallWheel1Rail).size(),
    }
    const calibration = {...points}

    calibration.expansionLinkRadiusCenter = circleCenterFrom3Points(
        calibration.expansionLinkTopEnd,
        calibration.expansionLinkFixedPoint,
        calibration.expansionLinkBottomEnd
    )

    const intersections = lineCircleIntersections(
        calibration.radiusBarA,
        calibration.radiusBarA.vectorTo(calibration.combinationLeverA),
        calibration.expansionLinkRadiusCenter,
        calibration.expansionLinkRadiusCenter.vectorTo(calibration.expansionLinkFixedPoint).size()
    )

    calibration.expansionLinkRadiusRod = intersections[0]

    calibration.valveCenter = points.valveB.addVector(points.valveB.vectorTo(points.valveC).mul(1/2))

    const valveConnectPointRatio = (calibration.valveCenter.y - calibration.combinationLeverA.y) /
                                   (calibration.combinationLeverB.y - calibration.combinationLeverA.y)

    const combinationLeverVector = calibration.combinationLeverA.vectorTo(calibration.combinationLeverB)

    calibration.valveConnectPoint = calibration.combinationLeverA.addVector(combinationLeverVector.mul(valveConnectPointRatio))
    calibration.reachRodEnd = calibration.reachRodEndMax

    const ret = {calibration, consts}
    Object.freeze(calibration)
    Object.freeze(consts)
    Object.freeze(ret)
    
    return ret
}

export default createCalibrationData
