import {Transformation} from "eeg2d"

const applyTransform = (model, transformation, dependentPoints) => {
    for (var point of dependentPoints) {
        model.point(point, transformation.transformPoint(model.calib(point)))
    }
}

const ConstantMechanics = (points) => (model, priv) => {
    for (var point of points) {
        model.point(point, model.calib(point))
    }
}

const NamedMechanics = (name, namedModel) => (model, priv) => {
    namedModel(model, priv)
    model.stat("name", name)
}

const WheelMechanics = (angleParam, centerPoint, dependentPoints) => (model, priv) => {
    const transformation = Transformation.rotate(model.param(angleParam), model.point(centerPoint))
    applyTransform(model, transformation, dependentPoints)
}

const MovementMechanics = (...args) => {
    if (args.length === 2) {
        const point = args[0]
        const dependentPoints = args[1]
        return (model, priv) => {
            const transformation = Transformation.translate(model.calib(point).vectorTo(model.point(point)))
            applyTransform(model, transformation, dependentPoints)
        }
    } else if (args.length === 3) {
        const point1 = args[0]
        const point2 = args[1]
        const dependentPoints = args[2]
        return (model, priv) => {
            const transformation = Transformation.twoPoint(model.calib(point1), model.calib(point2), model.point(point1), model.point(point2))
            applyTransform(model, transformation, dependentPoints)
        }
    } else {
        throw "Invalid number of arguments"
    }
    return (model, priv) => {
        var transform = crea
    }
}

class ComposedMechanics
{
    static add(model, name = undefined)
    {
        return new ComposedMechanics(model, name)
    }

    constructor(model, name = undefined)
    {
        this.models = []
        this.add(model, name)
    }

    add(model, name = undefined)
    {
        if (name !== null && name !== undefined) {
            model = NamedMechanics(name, model)
        }
        this.models.push(model)
        return this
    }

    create(inlined = false)
    {
        const models = this.models
        if (inlined) {
            return (model, priv) => {
                for (var mod of models) {
                    mod(model, priv)
                }
            }
        } else {
            return (model, priv) => {
                for (var mod of models) {
                    model.apply(mod)
                }
            }
        }
    }

}

const InterpolationMechanics = (point1, point2, movingPoint, valueCallback) => (model, priv) => {
    const interpolationValue = valueCallback(model)
    model.point(movingPoint, model.point(point1).interpolate(model.point(point2), interpolationValue))
}

export {MovementMechanics, WheelMechanics, ConstantMechanics, NamedMechanics, ComposedMechanics, InterpolationMechanics}
