export default (points) => (model, priv) => {
    for (var point of points) {
        model.point(point, model.calib(point))
    }
}
