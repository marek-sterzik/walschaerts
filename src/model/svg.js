import {Point, Transformation} from "eeg2d"

import {getParentTransform} from "../util/transform.js"

const toCamelCase = (id) => {
    return id.replace(/-(.)/g, (match) => match[1].toUpperCase())
}

const loadPointsFromSvg = (svg) => {
    const points = {}

    svg.find(".pt").each((pt) => {
        pt.remove()
        const bbox = pt.bbox()
        const x = bbox.x + bbox.width/2
        const y = bbox.y + bbox.height/2
        const point = new Point(x, y)
        const name = toCamelCase(pt.id().replace(/^pt\./, ''))
        points[name] = getParentTransform(pt).transformPoint(point)
    })
    Object.freeze(points)
    return points
}

export default loadPointsFromSvg
