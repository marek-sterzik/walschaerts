import {Transformation} from "eeg2d"

const transformConfig = new WeakMap

const createInitialTransformation = (svg) => {
    const transform = svg.attr("transform")
    if (transform) {
        return Transformation.create(transform)
    } else {
        return Transformation.identity()
    }
}

const createInitialParentTransformation = (svg) => {
    var transformation = Transformation.identity()
    var p = svg.parent()
    while (p !== null && p !== undefined && p.type !== 'svg') {
        transformation = createInitialTransformation(p).compose(transformation)
        p = p.parent()
    }
    return transformation
}

const createTransformConfig = (svg) => {
    const parentTransform = createInitialParentTransformation(svg)
    return {initial: createInitialTransformation(svg), parent: parentTransform, parentInv: parentTransform.inv()}
}

const getTransformConfig = (svg) => {
    if (transformConfig.has(svg)) {
        return transformConfig.get(svg)
    } else {
        const tc = createTransformConfig(svg)
        transformConfig.set(svg, tc)
        return tc
    }
}

const setTransform = (svg, transformation) => {
    const tc = getTransformConfig(svg)
    const finalTransform = tc.parentInv.compose(transformation.compose(tc.parent)).compose(tc.initial)
    svg.attr("transform", finalTransform.toString())
}

const getParentTransform = (svg) => {
    const tc = getTransformConfig(svg)
    return tc.parent
}

export {setTransform, getParentTransform}
