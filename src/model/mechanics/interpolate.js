export default class
{
    constructor(calibration)
    {
        this.calibration = calibration
        this.interpolations = []
    }

    addInterpolation(minPoint, maxPoint, pointName, valueCallback)
    {
        this.interpolations.push({minPoint, maxPoint, pointName, valueCallback })
        return this
    }

    solve(pointArray, paramsArray)
    {
        for (var interpolation of this.interpolations) {
            var minPoint = this.calibration[interpolation.minPoint]
            var maxPoint = this.calibration[interpolation.maxPoint]
            var value = interpolation.valueCallback(paramsArray)
            var point = minPoint.addVector(minPoint.vectorTo(maxPoint).mul(value))
            pointArray[interpolation.pointName] = point
        }
    }
}
