import {Point, Transformation} from "eeg2d"

const toCamelCase = (id) => {
    return id.replace(/-(.)/g, (match) => match[1].toUpperCase())
}

const loadPointsFromSvg = (svg) => {
    const points = {}

    svg.find(".pt").each((pt) => {
        pt.hide()
        const bbox = pt.bbox()
        const x = bbox.x + bbox.width/2
        const y = bbox.y + bbox.height/2
        var point = new Point(x, y)
        const name = toCamelCase(pt.id().replace(/^pt\./, ''))
        var p = pt.parent()
        while (p !== null && p !== undefined && p.type !== 'svg') {
            var transform = p.attr("transform")
            if (transform) {
                point = Transformation.create(transform).transformPoint(point)
            }
            p = p.parent()
        }
        points[name] = point
    })
    Object.freeze(points)
    return points
}

export default loadPointsFromSvg
