export default class
{
    constructor(calibration)
    {
        this.calibration = calibration
        this.statistics = {}
        this.points = []
    }

    addPoint(id)
    {
        this.points.push(id)
        return this
    }

    addPoints(points)
    {
        for (var point of points) {
            this.points.push(point)
        }
        return this
    }

    solve(pointArray, paramsArray)
    {
        var t0 = performance.now()

        for (var point of this.points) {
            pointArray[point] = this.calibration[point]
        }

        var t1 = performance.now()
        this.statistics['solveTime'] = t1 - t0
    }
}
