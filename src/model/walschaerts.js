import {Angle} from "eeg2d"
import {calibration, consts} from "./calibration.js"
import {distanceToAngle} from "./geometry.js"
import {wheelCenterModel, wheelsModel, wheelLinkModel, pistonModel, expansionLinkModel, reverseArmModel, reachRodModel} from "./mechanics.js"

export default class
{
    constructor()
    {
        this.calibration = calibration
        this.consts = consts
        
        //points which will contain points of the valve gear model
        this.points = {}

        //params contain other parameters of the valve gear model
        this.params = {
            "mainWheelAngle": Angle.zero(),
            "smallWheelAngle": Angle.zero(),
            "expansion": 1,
        }

        //the mechanic models itself
        this.mechanicModels = []

        //statistics and averages
        this.statistics = []
        this.averages = {}
        this.averageCycles = 10

        this.addModel("wheelCenters", wheelCenterModel)
        this.addModel("wheels", wheelsModel)
        this.addModel("wheelLink", wheelLinkModel)
        this.addModel("piston", pistonModel)
        this.addModel("expansionLink", expansionLinkModel)
        this.addModel("reverseArm", reverseArmModel)
        this.addModel("reachRod", reachRodModel)

        this.recalc()
    }

    addDistance(distance)
    {
        this.params.mainWheelAngle = this.params.mainWheelAngle.add(distanceToAngle(distance, this.consts.mainWheelRadius)) 
        this.params.smallWheelAngle = this.params.smallWheelAngle.add(distanceToAngle(distance, this.consts.smallWheelRadius))
        this.recalc()
    }

    setExpansion(expansion)
    {
        if (expansion > 1) {
            expansion = 1
        } else if (expansion < -1) {
            expansion = -1
        }
        this.params.expansion = expansion
        this.recalc()
    }

    getExpansion()
    {
        return this.params.expansion
    }

    addModel (name, model)
    {
        this.mechanicModels.push({
            "name": name,
            "model": model(this.calibration),
        })
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

        for (var i = 0; i < this.mechanicModels.length; i++) {
            var model = this.mechanicModels[i].model
            var modelName = this.mechanicModels[i].name
            var lt0 = performance.now()
            model.solve(this.points, this.params)
            var lt1 = performance.now()
            statistics.push({
                "model": modelName,
                "param": "solveTime",
                "value": lt1 - lt0
            })
            if ("statistics" in model) {
                for (var s in model.statistics) {
                    statistics.push({
                        "model": modelName,
                        "param": s,
                        "value": model.statistics[s],
                    })
                }
            }
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
