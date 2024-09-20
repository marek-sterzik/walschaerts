export default (point1, point2, movingPoint, valueCallback) => (model, priv) => {
    const interpolationValue = valueCallback(model)
    model.point(movingPoint, model.point(point1).interpolate(model.point(point2), interpolationValue))
}
