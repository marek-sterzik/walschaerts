export default class Model
{
    constructor(calibration)
    {
        this.calibration = calibration
        this.points = {}
        this.params = {}
        this.stats = {}
        this.statsStack = []
        this.modelPrivate = new WeakMap()
    }

    calib(name, value = undefined, allowEmpty = false)
    {
        if (value !== undefined) {
            throw "Cannot change calibration data"
        } else if (!(name in this.calibration)) {
            if (allowEmpty) {
                return undefined
            }
            throw `Trying to access unknown calibration point: ${name}`
        } else {
            return this.calibration[name]
        }
    }

    allCalib()
    {
        return this.calibration
    }

    point(name, value = undefined)
    {
        if (value !== undefined) {
            this.points[name] = value
            return this
        } else if (!(name in this.points)) {
            throw `Trying to access unknown point: ${name}`
        } else {
            return this.points[name]
        }
    }

    allPoints()
    {
        return Object.assign({}, this.points)
    }

    param(name, value = undefined)
    {
        if (value !== undefined) {
            this.params[name] = value
            return this
        } else if (!(name in this.params)) {
            throw `Trying to access unknown parameter: ${name}`
        } else {
            return this.params[name]
        }
    }

    allParams()
    {
        return Object.assign({}, this.params)
    }

    stat(name, value = undefined)
    {
        if (value !== undefined) {
            this.stats[name] = value
            return this
        } else if (!(name in this.stats)) {
            if (value === Model.ALLOW_MISSING) {
                return undefined
            }
            throw `Trying to access unknown statistics parameter: ${name}`
        } else {
            return this.stats[name]
        }
    }

    allStats()
    {
        const stats = Object.assign({}, this.stats)
        delete stats["__nextId"]
        delete stats["name"]
        return stats
    }

    apply(model)
    {
        if (!this.modelPrivate.has(model)) {
            this.modelPrivate.set(model, {})
        }
        const modelPrivate = this.modelPrivate.get(model)
        this.statsStack.push(this.stats)
        this.stats = {}
        const startTimestamp = performance.now()
        model(this, modelPrivate)
        this.stat("totalTime", performance.now() - startTimestamp)
        const currentStats = this.stats
        this.stats = this.statsStack.pop()
        var name
        delete currentStats["__nextId"]
        if ("name" in currentStats) {
            name = currentStats["name"]
            delete currentStats["name"]
        } else {
            var id = this.stat("__nextId", Model.ALLOW_MISSING)
            id = (id === undefined) ? 1 : id
            name = id
            this.stat("__nextId", id + 1)
        }
        for (var index in currentStats) {
            this.stat(`${name}.${index}`, currentStats[index])
        }
    }

    static ALLOW_MISSING = Object.freeze({})
}
