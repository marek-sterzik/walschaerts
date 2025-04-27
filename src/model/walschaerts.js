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

        this.data.param("mainWheelAngle", Angle.zero())
        this.data.param("smallWheelAngle", Angle.zero())
        this.data.param("expansion", 1)

        //statistics and averages
        this.averages = {}
        this.averageCycles = 10

        this.recalc()
    }

    addDistance(distance)
    {
        this.data.param("mainWheelAngle", this.data.param("mainWheelAngle").add(distanceToAngle(distance, this.calibration.mainWheelRadius)))
        this.data.param("smallWheelAngle", this.data.param("smallWheelAngle").add(distanceToAngle(distance, this.calibration.mainWheelRadius)))
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
        this.data.apply(walschaertsModel)
        
        const modelStats = this.data.allStats()
        for (var key in modelStats) {
            this.updateAverage(key, modelStats[key])
        }
    }

    updateAverage (id, value)
    {
        if (! (id in this.averages)) {
            this.averages[id] = value
        } else {
            this.averages[id] = this.averages[id] + (value - this.averages[id])/this.averageCycles
        }
    }
}
