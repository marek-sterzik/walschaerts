import Model from "./model.js"

export default class
{
    constructor(calibration, mainModel)
    {
        this.model = new Model(calibration)
        this.mainModel = mainModel
        this.statistics = {}
    }

    solve(pointArray, paramsArray)
    {
        this.model.param("mainWheelAngle", paramsArray['mainWheelAngle'])
        this.model.param("smallWheelAngle", paramsArray['smallWheelAngle'])
        this.model.param("expansion", paramsArray['expansion'])
        this.model.apply(this.mainModel)
        this.statistics = this.model.allStats()
        const points = this.model.allPoints()
        for (var name in points) {
            pointArray[name] = points[name]
        }
    }
}
