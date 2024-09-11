import {Point, Vector, Transformation} from "eeg2d"
import {PathArray} from '@svgdotjs/svg.js'

import {updatedComponents, updatedPoints, updatedLines, updatedCircles, updatedArcs} from "./def.js"

import {setTransform} from "../util/transform.js"

const dataAccessor = (model) => (id) => {
    var splitted = id.split(/\./, 2)
    var group
    if (splitted.length < 2) {
        group = 'points'
    } else {
        group = splitted[0]
        id = splitted[1]
    }
    return model[group][id]
}

export default class
{
    constructor(model, svg)
    {
        this.model = dataAccessor(model)
        this.svg = svg
        this.circles = {}
        this.points = {}
        this.lines = {}
        this.arcs = {}

        this.initialize()
    }

    initialize()
    {
        for (var c in updatedCircles) {
            this._putCircle(c, updatedCircles[c])
        }

        for (var p in updatedPoints) {
            this._putPoint(p, updatedPoints[p])
        }

        for (var l in updatedLines) {
            this._putLine(l, updatedLines[l])
        }

        for (var a in updatedArcs) {
            this._putArc(a, updatedArcs[a])
        }
    }

    _circle(center, radius)
    {
        return this.svg.circle(radius * 2).move(center.x - radius, center.y - radius)
    }

    _putCircle(circleId, circleDef)
    {
        const center = this.model(circleDef.center)
        const radius = this.model(circleDef.radius)
        this.circles[circleId] = this._circle(center, radius).fill('transparent').stroke(circleDef.stroke)
    }

    _putPoint(pointId, stroke)
    {
        var point = this.model(pointId)
        var group = this.svg.group()
        var size = 3.5
        group.line(-size, -size, size, size).stroke(stroke)
        group.line(-size, size, size, -size).stroke(stroke)
        group.center(point.x, point.y)
        this.points[pointId] = group
    }

    _putLine(lineId, lineDef)
    {
        var p1 = this.model(lineDef.p1)
        var p2 = this.model(lineDef.p2)
        var line = this.svg.line(p1.x, p1.y, p2.x, p2.y).stroke(lineDef.stroke)
        this.lines[lineId] = line
    }

    _putArc(arcId, arcDef)
    {
        var pathArray = this._getArcPathArray(arcDef)
        var arc = this.svg.path(pathArray).stroke(arcDef.stroke).fill('none')
        this.arcs[arcId] = arc
    }

    _getArcPathArray(arcDef)
    {
        var pFrom = this.model(arcDef.from)
        var pTo = this.model(arcDef.to)
        var pCenter = this.model(arcDef.center)

        var radius = pCenter.vectorTo(pFrom).size()

        return new PathArray([
            ['M', pFrom.x, pFrom.y],
            ['A', radius, radius, 0, 0, arcDef.clokwise ? 1 : 0, pTo.x, pTo.y],
        ])
    }

    _updatePoint(pointId)
    {
        var point = this.model(pointId)
        this.points[pointId].center(point.x, point.y)
    }

    _updateComponent(componentDef)
    {
        const p1Id = componentDef.p1
        const p2Id = componentDef.p2
        const components = this.svg.find("#" + componentDef.component)
        if (components.length > 0) {
            const component = components[0]
            const a1 = this.model("calibration." + p1Id)
            const b1 = this.model("calibration." + p2Id)
            const a2 = this.model(p1Id)
            const b2 = this.model(p2Id)
            const transformation = Transformation.twoPoint(a1, b1, a2, b2)
            setTransform(component, transformation)
        }
    }

    _updateLine(lineId, lineDef)
    {
        var p1 = this.model(lineDef.p1)
        var p2 = this.model(lineDef.p2)
        this.lines[lineId].plot(p1.x, p1.y, p2.x, p2.y)
    }

    _updateArc(arcId, arcDef)
    {
        var pathArray = this._getArcPathArray(arcDef)
        this.arcs[arcId].plot(pathArray)
    }

    update()
    {
        for (var p in updatedPoints) {
            this._updatePoint(p)
        }
        for (var l in updatedLines) {
            this._updateLine(l, updatedLines[l])
        }
        for (var a in updatedArcs) {
            this._updateArc(a, updatedArcs[a])
        }
        for (var c in updatedComponents) {
            this._updateComponent(updatedComponents[c])
        }
    }
}
