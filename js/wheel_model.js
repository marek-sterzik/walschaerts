function WheelModel(calibrationData)
{
    this.calibrationData = calibrationData;
    this.input = null;
    this.wheels = [];
    this.constraintCounter = 0;
}

WheelModel.prototype.addWheel = function (angleParam, wheelCenter, wheelPoints)
{
    var wp = [];
    for (var i = 0; i < wheelPoints.length; i++) {
        wp.push({
            "id": wheelPoints[i],
            "point": this.calibrationData[wheelPoints[i]]
        });
    }
    this.wheels.push({
        "angleParam": angleParam,
        "wheelCenter": this.calibrationData[wheelCenter],
        "wheelPoints": wp,
    });
}

WheelModel.prototype.solve = function (pointArray, paramsArray)
{
    for(var i = 0; i < this.wheels.length; i++) {
        var wheel = this.wheels[i];
        var angle = Angle.inRadians(paramsArray[wheel.angleParam]);
        var transformation = Transformation.rotation(wheel.wheelCenter, angle);
        for (var j = 0; j < wheel.wheelPoints.length; j++) {
            var p = wheel.wheelPoints[j].id;
            var point = wheel.wheelPoints[j].point;
            pointArray[p] = transformation.transformPoint(point);
        }
    }
}
