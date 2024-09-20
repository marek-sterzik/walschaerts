import {Angle} from "eeg2d"
import createCalibrationData from "./calibration.js"
import {distanceToAngle} from "./geometry.js"
import walschaertsModel from "./mechanics.js"
import Model from "./model.js"

export default class
{
    constructor(svg)
    {
        const calibrationData = createCalibrationData(svg)
        this.calibration = calibrationData.calibration
        this.consts = calibrationData.consts
        
        this.data = new Model(this.calibration)

        this.data.param("mainWheelAngle", Angle.zero())
        this.data.param("smallWheelAngle", Angle.zero())
        this.data.param("expansion", 1)

        //statistics and averages
        this.statistics = []
        this.averages = {}
        this.averageCycles = 10

        this.recalc()
    }

    addDistance(distance)
    {
        this.data.param("mainWheelAngle", this.data.param("mainWheelAngle").add(distanceToAngle(distance, this.consts.mainWheelRadius)))
        this.data.param("smallWheelAngle", this.data.param("smallWheelAngle").add(distanceToAngle(distance, this.consts.mainWheelRadius)))
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

        var lt0 = performance.now()
        this.data.apply(walschaertsModel)
        var lt1 = performance.now()
        statistics.push({
            "model": "model",
            "param": "solveTime",
            "value": lt1 - lt0
        })
        const modelStats = this.data.allStats()
        for (var s in modelStats) {
            statistics.push({
                "model": "model",
                "param": s,
                "value": modelStats[s],
            })
        }

        this._recalcStatistics(statistics, t0)
    }

    _recalcStatistics(statistics, t0)
    {
        var totalSolveTimeIndex = null
        for (var i = 0; i < statistics.length; i++) {
            var statRecord = statistics[i]
            if (statRecord.model == 'total' && statRecord.param == 'solveTime') {
                totalSolveTimeIndex = i
            } else {
                statRecord.value = this._updateAverage(statRecord.model+"."+statRecord.param, statRecord.value)
            }
        }

        if (totalSolveTimeIndex != null) {
            var totalSolveTime = performance.now() - t0
            var statRecord = statistics[totalSolveTimeIndex]
            statRecord.value = this._updateAverage(statRecord.model+"."+statRecord.param, totalSolveTime)
        }

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
