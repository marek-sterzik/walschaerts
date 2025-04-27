const ALLOW_MISSING = Object.freeze({})

const splitString = (string) => {
    const match = string.match(/^([^\.]*)\.(.*)$/)
    if (match) {
        return [match[1], match[2]]
    } else {
        return [string]
    }
}

class ModelPrivate
{
    constructor()
    {
        this.data = {}
    }

    get(prefix, model)
    {
        if (!(prefix in this.data)) {
            this.data[prefix] = new WeakMap()
        }

        if (!this.data[prefix].has(model)) {
            this.data[prefix].set(model, {})
        }
        
        return this.data[prefix].get(model)
    }
}

class ModelBase
{
    universalGetter(allowMissing = false)
    {
        return (name) => {
            const splitted = splitString(name)
            var group
            if (splitted.length < 2) {
                group = 'point'
            } else {
                group = splitted[0]
                name = splitted[1]
            }
            if (group === 'calibration' || group === 'consts') {
                group = "calib"
            }
            if (["calib", "point", "param", "stat"].includes(group)) {
                return this[group].apply(this, [name, allowMissing ? ALLOW_MISSING : undefined])
            } else {
                throw `trying to access invalid group ${group}`
            }
        }
    }

    universalSetter()
    {
        return (name, value) => {
            const splitted = splitString(name)
            var group
            if (splitted.length < 2) {
                group = 'point'
            } else {
                group = splitted[0]
                name = splitted[1]
            }
            if (group === 'calibration' || group === 'consts') {
                group = "calib"
            }
            if (["calib", "point", "param", "stat"].includes(group)) {
                return this[group].apply(this, [name, value])
            } else {
                throw `trying to access invalid group ${group}`
            }
        }
    }

    proxy(prefix = null, namespaced = false)
    {
        if (prefix !== undefined && prefix !== null && prefix !== '') {
            prefix = prefix + "."
        } else {
            prefix = ''
        }
        if (prefix === '') {
            return this
        }

        return new ModelProxy(this.getParentModel(), this.prefix + (namespaced ? prefix : ''), this.statPrefix + prefix, this.modelPrivate)
    }

    apply(model)
    {
        const modelPrivate = this.modelPrivate.get(this.prefix, model)
        const startTimestamp = performance.now()
        model(this, modelPrivate)
        this.stat("totalTime", performance.now() - startTimestamp)
    }


}

class ModelProxy extends ModelBase
{
    constructor(parentModel, prefix, statPrefix, modelPrivate)
    {
        super()
        this.parentModel = parentModel
        this.prefix = prefix
        this.statPrefix = statPrefix
        this.modelPrivate = modelPrivate

    }

    proxyName(name)
    {
        return this.prefix + name
    }

    proxyStatPrefixName(name)
    {
        return this.statPrefix + name
    }

    unprefix(data, prefix)
    {
        if (prefix === "") {
            return data
        }
        const finalData = {}
        for (var key in data) {
            var finalKey = null
            if (key.length >= prefix.length && key.substring(0, prefix.length) === prefix) {
                finalKey = key.substring(prefix.length)
            }

            if (finalKey !== null) {
                finalData[finalKey] = data[key]
            }
        }
        return finalData
    }

    calib(name, value = undefined)
    {
        return this.parentModel.calib(name, value)
    }

    calibGetter(name, allowMissing = false)
    {
        return this.parentModel.calibGetter(name, allowMissing)
    }

    allCalib()
    {
        return this.parentModel.allCalib()
    }

    allCalibGetter(allowMissing = false)
    {
        return this.parentModel.allCalibGetter(allowMissing)
    }

    point(name, value = undefined)
    {
        return this.parentModel.point(this.proxyName(name), value)
    }

    pointGetter(name, allowMissing = false)
    {
        return this.parentModel.pointGetter(this.proxyName(name), allowMissing)
    }

    allPoints()
    {
        return this.unprefix(this.parentModel.allPoints(), this.prefix)
    }

    allPointsGetter(allowMissing = false)
    {
        const getter = this.parentModel.allPointsGetter(allowMissing)
        return (name) => getter(this.proxyName(name))
    }

    param(name, value = undefined)
    {
        return this.parentModel.param(this.proxyName(name), value)
    }

    paramGetter(name, allowMissing = false)
    {
        return this.parentModel.paramGetter(this.proxyName(name), allowMissing)
    }

    allParams()
    {
        return this.unprefix(this.parentModel.allParams(), this.prefix)
    }

    allParamsGetter(allowMissing = false)
    {
        const getter = this.parentModel.allParamsGetter(allowMissing)
        return (name) => getter(this.proxyName(name))
    }

    stat(name, value = undefined)
    {
        return this.parentModel.stat(this.proxyStatPrefixName(name), value)
    }

    statGetter(name, allowMissing = false)
    {
        return this.parentModel.statGetter(this.proxyStatPrefixName(name), allowMissing)
    }

    allStats()
    {
        return this.unprefix(this.parentModel.allStats(), this.statPrefix)
    }

    allStatsGetter(allowMissing = false)
    {
        const getter = this.parentModel.allStatsGetter(allowMissing)
        return (name) => getter(this.proxyStatPrefixName(name))
    }

    getParentModel()
    {
        return this.parentModel
    }
}

export default class Model extends ModelBase
{
    constructor(calibration)
    {
        super()
        this.calibration = calibration
        this.points = {}
        this.params = {}
        this.stats = {}
        this.statsStack = []
        this.modelPrivate = new ModelPrivate()
        this.modelNames = new WeakMap()
        this.prefix = ""
        this.statPrefix = ""
    }

    calib(name, value = undefined)
    {
        if (value !== undefined && value !== ALLOW_MISSING) {
            throw "Cannot change calibration data"
        } else if (!(name in this.calibration)) {
            if (value === ALLOW_MISSING) {
                return undefined
            }
            throw `Trying to access unknown calibration point: ${name}`
        } else {
            return this.calibration[name]
        }
    }

    calibGetter(name, allowMissing = false)
    {
        return () => this.calib(name, allowMissing ? ALLOW_MISSING : undefined)
    }

    allCalib()
    {
        return {...this.calibration}
    }

    allCalibGetter(allowMissing = false)
    {
        return (name) => this.calib(name, allowMissing ? ALLOW_MISSING : undefined)
    }

    point(name, value = undefined)
    {
        if (value !== undefined && value !== ALLOW_MISSING) {
            this.points[name] = value
            return this
        } else if (!(name in this.points)) {
            if (value === ALLOW_MISSING) {
                return undefined
            }
            throw `Trying to access unknown point: ${name}`
        } else {
            return this.points[name]
        }
    }

    pointGetter(name, allowMissing = false)
    {
        return () => this.point(name, allowMissing ? ALLOW_MISSING : undefined)
    }


    allPoints()
    {
        return {...this.points}
    }

    allPointsGetter(allowMissing = false)
    {
        return (name) => this.point(name, allowMissing ? ALLOW_MISSING : undefined)
    }

    param(name, value = undefined)
    {
        if (value !== undefined && value !== ALLOW_MISSING) {
            this.params[name] = value
            return this
        } else if (!(name in this.params)) {
            if (value === ALLOW_MISSING) {
                return undefined
            }
            throw `Trying to access unknown parameter: ${name}`
        } else {
            return this.params[name]
        }
    }

    paramGetter(name, allowMissing = false)
    {
        return () => this.param(name, allowMissing ? ALLOW_MISSING : undefined)
    }


    allParams()
    {
        return {...this.params}
    }

    allParamsGetter(allowMissing = false)
    {
        return (name) => this.param(name, allowMissing ? ALLOW_MISSING : undefined)
    }

    stat(name, value = undefined)
    {
        if (value !== undefined && value !== ALLOW_MISSING) {
            this.stats[name] = value
            return this
        } else if (!(name in this.stats)) {
            if (value === ALLOW_MISSING) {
                return undefined
            }
            throw `Trying to access unknown statistics parameter: ${name}`
        } else {
            return this.stats[name]
        }
    }

    statGetter(name, allowMissing = false)
    {
        return () => this.stat(name, allowMissing ? ALLOW_MISSING : undefined)
    }

    allStats()
    {
        const stats = {...this.stats}
        delete stats["__nextId"]
        delete stats["name"]
        return stats
    }

    allStatsGetter(allowMissing = false)
    {
        return (name) => this.stat(name, allowMissing ? ALLOW_MISSING : undefined)
    }

    getParentModel()
    {
        return this
    }

    static ALLOW_MISSING = ALLOW_MISSING
}
