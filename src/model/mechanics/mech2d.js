import {Mechanics, Body} from "mech2d"
import {Point} from "eeg2d"
import {calcMassCenter} from "../geometry.js"

export default class
{
    constructor(calibration)
    {
        this.calibration = calibration
        this.mechanics = null
        this.bodies = {}
        this.inputs = []
        this.outputs = {}
        this.links = []
        this.points = {}
        this.statistics = {}
    }

    inputPoint(point, body)
    {
        this.ensureBody(body)
        this.bodies[body].points.push(point)
        this.inputs.push({point, body})
    }

    outputPoint(point, body)
    {
        this.ensureBody(body)
        if (body !== null && body !== undefined) {
            this.bodies[body].points.push(point)
        }
        this.outputs[point] = {bodyName: body}
    }

    link(body1, point1, body2, point2 = undefined)
    {
        this.ensureBody(body1).ensureBody(body2)
        this.links.push({body1, point1, body2, point2})
    }

    ensureBody(body)
    {
        if (this.mechanics !== null) {
            throw "cannot change already working model"
        }
        if (body === null || body === undefined) {
            return this
        }
        if (!(body in this.bodies)) {
            this.bodies[body] = {points: []}
        }
        return this
    }

    ensureMechanicsCreated()
    {
        if (this.mechanics !== null) {
            return
        }
        for (var bodyName in this.bodies) {
            var bodyDescriptor = this.bodies[bodyName]
            var points = bodyDescriptor.points.map((name) => this.calibration[name])
            this.bodies[bodyName] = new Body(calcMassCenter(points, Point.origin()))
        }
        this.mechanics = new Mechanics()
        this.tuneMechanics()
        for (var body in this.bodies) {
            this.mechanics.addBody(this.bodies[body])
        }
        
        for (var pointName in this.outputs) {
            var bodyName = this.outputs[pointName].bodyName
            if (bodyName !== null && bodyName !== undefined) {
                var body = this.bodies[bodyName]
                this.outputs[pointName].body = body
                this.outputs[pointName].point = body.universalToBodyCoords(this.calibration[pointName])
            } else {
                this.outputs[pointName].body = null
                this.outputs[pointName].point = this.calibration[pointName]
            }
        }

        for (var input of this.inputs) {
            var pointName = input.point
            var point = this.calibration[pointName]
            var body = this.bodies[input.body]
            body.link(null, point, () => this.points[pointName])
        }
        this.inputs = null

        for (var link of this.links) {
            var body1 = this.bodies[link.body1]
            var body2 = link.body2
            if (body2 !== null && body2 !== undefined) {
                body2 = this.bodies[body2]
            }
            var point1 = link.point1
            if (typeof point1 === 'string') {
                point1 = this.calibration[point1]
            }
            var point2 = link.point2
            if (typeof point2 === 'string') {
                point2 = this.calibration[point2]
            }
            body1.link(body2, point1, point2)
        }
        this.links = null
    }

    tuneMechanics()
    {
        this.mechanics.tQuantum = 1
        this.mechanics.maxIterations = 100000
    }

    copyOutput()
    {
        for (var pointName in this.outputs) {
            var body = this.outputs[pointName].body
            var point = this.outputs[pointName].point
            if (body !== null && body !== undefined) {
                point = body.bodyToUniversalCoords(point)
            }
            this.points[pointName] = point
        }
    }

    solve(pointArray, paramsArray)
    {
        this.ensureMechanicsCreated()
        this.points = pointArray
        this.statistics.iterations = this.mechanics.solve()
        console.log(this.mechanics)
        this.copyOutput()
    }
}
