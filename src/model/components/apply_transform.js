const applyTransform = (model, transformation, dependentPoints) => {
    for (var point of dependentPoints) {
        model.point(point, transformation.transformPoint(model.calib(point)))
    }
}

export default applyTransform
