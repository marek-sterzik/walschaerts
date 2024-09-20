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
        this.modelNames = new WeakMap()
    }

    calib(name, value = undefined)
    {
        if (value !== undefined && value !== Model.ALLOW_MISSING) {
            throw "Cannot change calibration data"
        } else if (!(name in this.calibration)) {
            if (value === Model.ALLOW_MISSING) {
                return undefined
            }
            throw `Trying to access unknown calibration point: ${name}`
        } else {
            return this.calibration[name]
        }
    }

    calibGetter(name, allowMissing = false)
    {
        return () => this.calib(name, allowMissing ? Model.ALLOW_MISSING : undefined)
    }

    allCalib()
    {
        return this.calibration
    }

    allCalibGetter(allowMissing = false)
    {
        return (name) => this.calib(name, allowMissing ? Model.ALLOW_MISSING : undefined)
    }

    point(name, value = undefined)
    {
        if (value !== undefined && value !== Model.ALLOW_MISSING) {
            this.points[name] = value
            return this
        } else if (!(name in this.points)) {
            if (value === Model.ALLOW_MISSING) {
                return undefined
            }
            throw `Trying to access unknown point: ${name}`
        } else {
            return this.points[name]
        }
    }

    pointGetter(name, allowMissing = false)
    {
        return () => this.point(name, allowMissing ? Model.ALLOW_MISSING : undefined)
    }


    allPoints()
    {
        return Object.assign({}, this.points)
    }

    allPointsGetter(allowMissing = false)
    {
        return (name) => this.point(name, allowMissing ? Model.ALLOW_MISSING : undefined)
    }

    param(name, value = undefined)
    {
        if (value !== undefined && value !== Model.ALLOW_MISSING) {
            this.params[name] = value
            return this
        } else if (!(name in this.params)) {
            if (value === Model.ALLOW_MISSING) {
                return undefined
            }
            throw `Trying to access unknown parameter: ${name}`
        } else {
            return this.params[name]
        }
    }

    paramGetter(name, allowMissing = false)
    {
        return () => this.param(name, allowMissing ? Model.ALLOW_MISSING : undefined)
    }


    allParams()
    {
        return Object.assign({}, this.params)
    }

    allParamsGetter(allowMissing = false)
    {
        return (name) => this.param(name, allowMissing ? Model.ALLOW_MISSING : undefined)
    }

    stat(name, value = undefined)
    {
        if (value !== undefined && value !== Model.ALLOW_MISSING) {
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

    statGetter(name, allowMissing = false)
    {
        return () => this.stat(name, allowMissing ? Model.ALLOW_MISSING : undefined)
    }

    allStats()
    {
        const stats = Object.assign({}, this.stats)
        delete stats["__nextId"]
        delete stats["name"]
        return stats
    }

    allStatsGetter(allowMissing = false)
    {
        return (name) => this.stat(name, allowMissing ? Model.ALLOW_MISSING : undefined)
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
        if (this.modelNames.has(model)) {
            name = this.modelNames.get(model)
        } else {
            if ("name" in currentStats) {
                name = currentStats["name"]
            } else {
                var id = this.stat("__nextId", Model.ALLOW_MISSING)
                id = (id === undefined) ? 1 : id
                name = id
                this.stat("__nextId", id + 1)
            }
            this.modelNames.set(model, name)
        }
        delete currentStats["__nextId"]
        delete currentStats["name"]
        for (var index in currentStats) {
            this.stat(`${name}.${index}`, currentStats[index])
        }
    }

    static ALLOW_MISSING = Object.freeze({})
}
