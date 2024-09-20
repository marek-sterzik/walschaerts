import {Transformation} from "eeg2d"
import applyTransform from "./apply_transform.js"

export default (angleParam, centerPoint, dependentPoints) => (model, priv) => {
    const transformation = Transformation.rotate(model.param(angleParam), model.point(centerPoint))
    applyTransform(model, transformation, dependentPoints)
}
