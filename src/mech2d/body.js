import {Point, Vector, Angle, Transformation} from "eeg2d"
import BodyLink from "./link.js"

var uniqueBodyId = 1


export default class Body
{
    constructor(massCenter)
    {
        this.id = uniqueBodyId++
        this.track = Point.origin().vectorTo(Point.create(massCenter))
        this.angularTrack = Angle.zero()
        this.trackDelta = Vector.zero()
        this.angularDelta = Angle.zero()
        this.maxMove = null
        this.links = {}
        this.updateCurrentTransformation()
    }

    getId = () => this.id

    updateCurrentTransformation = () => {
        this.currentTransformation = Transformation.translate(this.track).compose(Transformation.rotate(this.angularTrack))
        this.currentInverseTransformation = this.currentTransformation.inv()
    }

    universalToBodyCoords = (vectorOrPoint) => this.currentInverseTransformation.transform(vectorOrPoint)
    bodyToUniversalCoords = (vectorOrPoint) => this.currentTransformation.transform(vectorOrPoint)

    link = (point, point2, factor = 0.5) => {
        if ((point2 instanceof Point) || (point2 instanceof Vector)) {
            const pt2 = point2
            point2 = () => pt2
        }
        if (typeof point2 !== "function") {
            throw "Invalid argument point2 of the linked point"
        }
        if (typeof factor === 'number' && isFinite(factor)) {
            const f = factor
            factor = () => f
        }
        if (typeof factor !== "function") {
            throw "Invalid argument factor of the linked point"
        }

        const link = new BodyLink(this, this.universalToBodyCoords(point), point2, factor)
        const linkId = link.getId()
        this.links[linkId] = link
        return link
    }

    unlink = (link) => {
        const id = link.getId()
        if (id in this.links) {
            delete this.links[id]
        }
        return this
    }

    getPoint(point)
    {
        const pt = this.universalToBodyCoords(point)
        return () => this.bodyToUniversalCoords(pt)
    }

    stable = (sizeLimit) => {
        return this.maxMove !== null && this.maxMove < sizeLimit
    }

    commitMove = () => {
        this.track = this.track.add(this.trackDelta)
        this.angularTrack = this.angularTrack.add(this.angularDelta).normalize()
        this.trackDelta = Vector.zero()
        this.angularDelta = Angle.zero()
        this.updateCurrentTransformation()
        return this
    }

    move = (commit = true) => {
        var trackDelta = Vector.zero()
        var angularDelta = Angle.zero()
        var n = 0
        this.maxMove = 0
        for (var linkId in this.links) {
            var link = this.links[linkId]
            n++
            const point = link.getMovementPoint()
            const vector = link.getMovementVector()
            const radiusVector = Point.origin().vectorTo(point)
            this.maxMove = Math.max(this.maxMove, vector.size())
            if (!radiusVector.isZero()) {
                const radius = radiusVector.size()
                const radiusNorm = radiusVector.mul(1/radius)
                const tangent = radiusNorm.rot(Angle.right())
                const angle = Angle.rad(Math.max(-1, Math.min(1, tangent.mul(vector)/radius)))
                angularDelta = angularDelta.add(angle)
            }
            trackDelta = trackDelta.add(vector)
        }
        this.trackDelta = this.bodyToUniversalCoords(this.trackDelta.add(trackDelta.mul(1/n)))
        this.angularDelta = this.angularDelta.add(angularDelta.mul(1/n))
        if (commit) {
            this.commitMove()
        }
        return this
    }
}
