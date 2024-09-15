var bodyLinkUniqueId = 1

import {Point} from "eeg2d"

export default class BodyLink
{
    constructor(body, point, point2, factor)
    {
        this.uniqid = bodyLinkUniqueId++
        this.body = body
        this.point = point
        this.point2 = point2
        this.factor = factor
        Object.freeze(this)
    }

    getId()
    {
        return this.uniqid
    }
    
    getMovementPoint()
    {
        return this.point
    }

    getMovementVector()
    {
        const pointUniversal = this.body.bodyToUniversalCoords(this.point)
        const factor = this.factor(pointUniversal)
        const pt2 = this.point2
        var target = this.body.universalToBodyCoords(this.point2(pointUniversal))
        if (target instanceof Point) {
            target = this.point.vectorTo(target)
        }
        target = target.mul(factor)
        return target
    }
}
