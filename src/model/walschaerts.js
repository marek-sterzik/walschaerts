import {Angle} from "eeg2d"
import {distanceToAngle} from "../geometry.js"
import walschaertsModel from "./mechanics.js"
import Model from "./model.js"

export default class
{
    constructor(calibration)
    {
        this.calibration = calibration
        
        this.data = new Model(this.calibration)
        this.data2 = new Model(this.calibration)

        this.data.param("mainWheelAngle", Angle.zero())
        this.data.param("smallWheelAngle", Angle.zero())
        this.data.param("expansion", 1)
        
        this.data2.param("mainWheelAngle", Angle.right())
        this.data2.param("smallWheelAngle", Angle.zero())
        this.data2.param("expansion", 1)

        //statistics and averages
        this.statistics = []
        this.averages = {}
        this.averageCycles = 10

        this.recalc()
    }

    addDistance(distance)
    {
        this.data.param("mainWheelAngle", this.data.param("mainWheelAngle").add(distanceToAngle(distance, this.calibration.mainWheelRadius)))
        this.data.param("smallWheelAngle", this.data.param("smallWheelAngle").add(distanceToAngle(distance, this.calibration.mainWheelRadius)))
        this.data2.param("mainWheelAngle", this.data.param("mainWheelAngle").add(Angle.right()))
        this.data2.param("smallWheelAngle", this.data.param("smallWheelAngle"))
        this.recalc()
    }

    setExpansion(expansion)
    {
        if (expansion > 1) {
            expansion = 1
        } else if (expansion < -1) {
            expansion = -1
        }
        this.data.param("expansion", expansion)
        this.recalc()
    }

    getExpansion()
    {
        return this.data.param("expansion")
    }

    recalc()
    {
        var t0 = performance.now()
        
        var statistics = []

        //push the total solve time slot into the statistics
        //the real value will be computed last
        statistics.push({
            "model": "total",
            "param": "solveTime",
            "value": 0,
        })

        var l1t0 = performance.now()
        this.data.apply(walschaertsModel)
        var l1t1 = performance.now()
        
        var l2t0 = performance.now()
        this.data2.apply(walschaertsModel)
        var l2t1 = performance.now()

        statistics.push({
            "model": "model1",
            "param": "solveTime",
            "value": l1t1 - l1t0
        })
        const modelStats = this.data.allStats()
        for (var s in modelStats) {
            statistics.push({
                "model": "model1",
                "param": s,
                "value": modelStats[s],
            })
        }
        statistics.push({
            "model": "model2",
            "param": "solveTime",
            "value": l2t1 - l2t0
        })
        const modelStats2 = this.data2.allStats()
        for (var s in modelStats2) {
            statistics.push({
                "model": "model2",
                "param": s,
                "value": modelStats2[s],
            })
        }

        for (var i = 1; i < statistics.length; i++) {
            statistics[i].value = this._updateAverage(statistics[i].model+"."+statistics[i].param, statistics[i].value)
        }
        statistics[0].value = performance.now() - t0
        statistics[0].value = this._updateAverage(statistics[0].model+"."+statistics[0].param, statistics[0].value)

        this.statistics = statistics

    }

    _updateAverage (id, value)
    {
        if (! (id in this.averages)) {
            this.averages[id] = value
        } else {
            this.averages[id] = this.averages[id] + (value - this.averages[id])/this.averageCycles
        }
        return this.averages[id]
    }
}
