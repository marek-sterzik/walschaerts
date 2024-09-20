import {Mechanics, Body} from "../../mech2d/mech2d.js"
import {Point} from "eeg2d"
import {calcMassCenter} from "../geometry.js"

class Mech2dBuilder
{
    constructor()
    {
        this.bodies = {}
        this.inputs = []
        this.outputs = {}
        this.links = []
    }

    factor(interBody = true)
    {
        return interBody ? 1.2 : 1.2
    }

    inputPoint(point, body)
    {
        this.ensureBody(body)
        this.bodies[body].points.push(point)
        this.inputs.push({point, body})
        return this
    }

    massCenter(point, body)
    {
        this.ensureBody(body)
        this.bodies[body].massCenter = point
        return this
    }

    outputPoint(point, body)
    {
        this.ensureBody(body)
        if (body !== null && body !== undefined) {
            this.bodies[body].points.push(point)
        }
        this.outputs[point] = {bodyName: body}
        return this
    }

    link(body1, point1, body2, point2 = undefined)
    {
        if (point2 === undefined || point2 === null) {
            point2 = point1
        }
        this.ensureBody(body1).ensureBody(body2)
        this.links.push({body1, point1, body2, point2})
        return this
    }

    ensureBody(body)
    {
        if (body === null || body === undefined) {
            return this
        }
        if (!(body in this.bodies)) {
            this.bodies[body] = {points: [], massCenter: null}
        }
        return this
    }

    createMechanics(model)
    {
        for (var bodyName in this.bodies) {
            var bodyDescriptor = this.bodies[bodyName]
            var massCenter = bodyDescriptor.massCenter
            if (massCenter === null) {
                var points = bodyDescriptor.points.map((name) => model.calib(name))
                massCenter = calcMassCenter(points, Point.origin())
            }
            this.bodies[bodyName] = new Body(massCenter)
        }
        const mechanics = new Mechanics()
        this.tuneMechanics(mechanics)
        for (var body in this.bodies) {
            mechanics.addBody(this.bodies[body])
        }
        
        const outputs = {}
        for (var pointName in this.outputs) {
            var bodyName = this.outputs[pointName].bodyName
            if (bodyName !== null && bodyName !== undefined) {
                var body = this.bodies[bodyName]
                outputs[pointName] = body.getPoint(model.calib(pointName))
            } else {
                outputs[pointName] = model.calibGetter(pointName)
            }
        }

        for (var input of this.inputs) {
            var pointName = input.point
            var point = model.calib(pointName)
            var body = this.bodies[input.body]
            body.link(point, model.pointGetter(pointName), this.factor(false))
        }

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
                point1 = model.calib(point1)
            } else {
                throw "point linked with a body must be static"
            }
            var point2 = link.point2
            if (typeof point2 === 'string') {
                point2 = model.calib(point2)
            } else {
                if (body2 !== null) {
                    throw "point linked with a body must be static"
                }
                const pointCallback = point2
                point2 = (pt) => pointCallback(pt, model.allPointsGetter())
            }

            if (body2 !== null) {
                body1.link(point1, body2.getPoint(point2), this.factor(true))
            } else {
                body1.link(point1, point2, this.factor(false))
            }

            if (body2 !== null) {
                body2.link(point2, body1.getPoint(point1), this.factor(true))
            }
        }
        return [mechanics, outputs]
    }


    tuneMechanics(mechanics)
    {
        mechanics.immediateCommit = true
        mechanics.maxIterations = 1000
    }
}

const Mech2dMechanics = (initialize) => (model, priv) => {
    if (!("model" in priv)) {
        const builder = new Mech2dBuilder()
        initialize(builder, model.allCalibGetter());
        [priv.mechanics, priv.outputs] = builder.createMechanics(model)
    }

    const iterations = priv.mechanics.solve()

    model.stat("iterations", iterations)

    for (var pointName in priv.outputs) {
        const point = priv.outputs[pointName]
        model.point(pointName, point())
    }
}

export default Mech2dMechanics

