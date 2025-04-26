export default (holeLeftPoint, holeRightPoint, valveEdgePoint, isLeftEdge, outputOpennessParam) => (model, priv) => {
    const ptLeft = model.point(holeLeftPoint)
    const ptRight = model.point(holeRightPoint)
    const ptControl = model.point(valveEdgePoint)
    
    const holeVector = ptLeft.vectorTo(ptRight)
    const controlVector = ptLeft.vectorTo(ptControl)

    var openness = holeVector.normalize().mul(controlVector) / holeVector.size()
    if (openness < 0) {
        openness = 0
    } else if (openness > 1) {
        openness = 1
    }

    if (!isLeftEdge) {
        openness = 1 - openness
    }

    model.param(outputOpennessParam, openness)
}
