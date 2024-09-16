import {Mechanics, Body} from "../../mech2d/mech2d.js"
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

    factor()
    {
        return 0.5
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
        if (point2 === undefined || point2 === null) {
            point2 = point1
        }
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
                this.outputs[pointName].point = body.getPoint(this.calibration[pointName])
            } else {
                this.outputs[pointName].point = () => this.calibration[pointName]
            }
        }

        for (var input of this.inputs) {
            var pointName = input.point
            var point = this.calibration[pointName]
            var body = this.bodies[input.body]
            body.link(point, point, 1)
        }
        this.inputs = null

        for (var link of this.links) {
            var body1 = this.bodies[link.body1]
            var body2 = link.body2
            if (body2 !== null && body2 !== undefined) {
                body2 = this.bodies[body2]
            } else {
                body2 = null
            }
            var point1 = link.point1
            if (typeof point1 === 'string') {
                point1 = this.calibration[point1]
            } else {
                throw "point bound to a body must be static"
            }
            var point2 = link.point2
            if (typeof point2 === 'string') {
                point2 = this.calibration[point2]
            } else {
                if (body2 !== null) {
                    throw "point bound to a body must be static"
                }
            }

            if (body2 !== null) {
                body1.link(point1, body2.getPoint(point2), this.factor())
            } else {
                body1.link(point1, point2, this.factor())
            }

            if (body2 !== null) {
                body2.link(point2, point1, this.factor())
            }
        }
        this.links = null
    }

    tuneMechanics()
    {
    }

    copyOutput()
    {
        for (var pointName in this.outputs) {
            var point = this.outputs[pointName].point
            this.points[pointName] = point()
        }
    }

    solve(pointArray, paramsArray)
    {
        this.ensureMechanicsCreated()
        this.points = pointArray
        this.statistics.iterations = this.mechanics.solve()
        this.copyOutput()
    }
}
