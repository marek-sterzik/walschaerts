import {Angle, Transformation} from "eeg2d"

export default class
{
    constructor(calibrationData)
    {
        this.calibrationData = calibrationData
        this.input = null
        this.wheels = []
        this.constraintCounter = 0
        this.statistics = {}
    }

    addPointDrivenWheel(referenceMovingPoint, wheelCenter, wheelPoints)
    {
        var referenceVector = this.calibrationData[wheelCenter].vectorTo(this.calibrationData[referenceMovingPoint])
        this._addWheel(function(pointArray, paramsArray, wheelCenter) {
            var vector = wheelCenter.vectorTo(pointArray[referenceMovingPoint])
            return referenceVector.angleTo(vector)
        }, wheelCenter, wheelPoints)
    }

    addWheel(angleParam, wheelCenter, wheelPoints)
    {
        this._addWheel(function(pointArray, paramsArray, wheelCenter) {
            return paramsArray[angleParam]
        }, wheelCenter, wheelPoints)
    }

    addWheelWithLinearAngleCompensation(angleParam, angleMultiplier, angleOffset, wheelCenter, wheelPoints)
    {
        this._addWheel(function(pointArray, paramsArray, wheelCenter) {
            return angleMultiplier.mul(paramsArray[angleParam]).add(angleOffset)
        }, wheelCenter, wheelPoints)
    }

    _addWheel(angleCallback, wheelCenter, wheelPoints)
    {
        var wp = []
        for (var i = 0; i < wheelPoints.length; i++) {
            wp.push({
                "id": wheelPoints[i],
                "point": this.calibrationData[wheelPoints[i]]
            })
        }
        this.wheels.push({
            "angleCallback": angleCallback,
            "wheelCenter": this.calibrationData[wheelCenter],
            "wheelPoints": wp,
        })
    }

    solve(pointArray, paramsArray)
    {
        var t0 = performance.now()

        for(var i = 0; i < this.wheels.length; i++) {
            var wheel = this.wheels[i]
            var angle = wheel.angleCallback.call(this, pointArray, paramsArray, wheel.wheelCenter)
            var transformation = Transformation.rotate(angle, wheel.wheelCenter)
            for (var j = 0; j < wheel.wheelPoints.length; j++) {
                var p = wheel.wheelPoints[j].id
                var point = wheel.wheelPoints[j].point
                pointArray[p] = transformation.transformPoint(point)
            }
        }

        var t1 = performance.now()
        this.statistics['solveTime'] = t1 - t0
    }
}
