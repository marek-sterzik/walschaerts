import {Transformation} from "eeg2d"
import applyTransform from "./apply_transform.js"

export default (...args) => {
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
