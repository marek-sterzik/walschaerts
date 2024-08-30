import {Angle, Transformation} from "eeg2d"

function WheelModel(calibrationData)
{
    this.calibrationData = calibrationData;
    this.input = null;
    this.wheels = [];
    this.constraintCounter = 0;
    this.statistics = {};
}

WheelModel.prototype.addPointDrivenWheel = function (referenceMovingPoint, wheelCenter, wheelPoints)
{
    var referenceVector = this.calibrationData[wheelCenter].vectorTo(this.calibrationData[referenceMovingPoint]);
    this._addWheel(function(pointArray, paramsArray, wheelCenter) {
        var vector = wheelCenter.vectorTo(pointArray[referenceMovingPoint]);
        return referenceVector.angleTo(vector);
    }, wheelCenter, wheelPoints);
}

WheelModel.prototype.addWheel = function (angleParam, wheelCenter, wheelPoints)
{
    this._addWheel(function(pointArray, paramsArray, wheelCenter) {
        return Angle.rad(paramsArray[angleParam]);
    }, wheelCenter, wheelPoints);
}

WheelModel.prototype.addWheelWithLinearAngleCompensation = function (angleParam, angleMultiplier, angleOffset, wheelCenter, wheelPoints)
{
    this._addWheel(function(pointArray, paramsArray, wheelCenter) {
        return Angle.rad(angleMultiplier * paramsArray[angleParam] + angleOffset);
    }, wheelCenter, wheelPoints);
}


WheelModel.prototype._addWheel = function (angleCallback, wheelCenter, wheelPoints)
{
    var wp = [];
    for (var i = 0; i < wheelPoints.length; i++) {
        wp.push({
            "id": wheelPoints[i],
            "point": this.calibrationData[wheelPoints[i]]
        });
    }
    this.wheels.push({
        "angleCallback": angleCallback,
        "wheelCenter": this.calibrationData[wheelCenter],
        "wheelPoints": wp,
    });
}


WheelModel.prototype.solve = function (pointArray, paramsArray)
{
    var t0 = performance.now();

    for(var i = 0; i < this.wheels.length; i++) {
        var wheel = this.wheels[i];
        var angle = wheel.angleCallback.call(this, pointArray, paramsArray, wheel.wheelCenter);
        var transformation = Transformation.rotate(angle, wheel.wheelCenter);
        for (var j = 0; j < wheel.wheelPoints.length; j++) {
            var p = wheel.wheelPoints[j].id;
            var point = wheel.wheelPoints[j].point;
            pointArray[p] = transformation.transformPoint(point);
        }
    }

    var t1 = performance.now();
    this.statistics['solveTime'] = t1 - t0;
}

export default WheelModel
