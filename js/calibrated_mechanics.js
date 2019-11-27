function CalibratedMechanics(calibrationData)
{
    this.mechanics = new Mechanics;
    this.statistics = this.mechanics.statistics;
    this.calibrationData = calibrationData;
    this.inputs = {};
    this.outputs = {};
    this.constraintCounter = 0;

}

CalibratedMechanics.prototype.getNextConstraintId = function ()
{
    return "constraint_"+(this.constraintCounter++);
}

CalibratedMechanics.prototype.getInputConstraintId = function (pointId)
{
    return "input_"+pointId;
}

CalibratedMechanics.prototype.ensurePointAdded = function (pointId)
{
    if (!this.mechanics.isPointSet(pointId)) {
        this.mechanics.setPoint(pointId, this.getCalibrationPoint(pointId));
    }
}

CalibratedMechanics.prototype.getCalibrationPoint = function (pointId)
{
    return this.calibrationData[pointId];
}

CalibratedMechanics.prototype.addDistanceConstraints = function(distanceConstraints)
{
    for (var i = 0; i < distanceConstraints.length; i++) {
        var p1 = distanceConstraints[i][0];
        var p2 = distanceConstraints[i][1];
        var p1c = this.calibrationData[p1];
        var p2c = this.calibrationData[p2];

        this.ensurePointAdded(p1);
        this.ensurePointAdded(p2);
        var distance = this.getCalibrationPoint(p1).vectorTo(this.getCalibrationPoint(p2)).size();
        this.mechanics.setDistanceConstraint(this.getNextConstraintId(), p1, p2, distance);
    }
}

CalibratedMechanics.prototype.addLineConstraints = function(lineConstraints)
{
    for (var i = 0; i < lineConstraints.length; i++) {
        var p = lineConstraints[i][0];
        var v = lineConstraints[i][1];
        
        this.ensurePointAdded(p);
        this.mechanics.setLineConstraint(this.getNextConstraintId(), p, this.getCalibrationPoint(p), v);
    }
}

CalibratedMechanics.prototype.addFixedPointConstraints = function(fixedPointConstraints)
{
    for (var i = 0; i < fixedPointConstraints.length; i++) {
        var p = fixedPointConstraints[i];
        this.ensurePointAdded(p);
        this.mechanics.setFixedPointConstraint(this.getNextConstraintId(), p, this.getCalibrationPoint(p));
    }
}

CalibratedMechanics.prototype.addInputs = function(inputs)
{
    for (var i = 0; i < inputs.length; i++) {
        var p = inputs[i];
        this.ensurePointAdded(p);
        this.inputs[p] = true;
        this.mechanics.setFixedPointConstraint(this.getInputConstraintId(p), p, this.getCalibrationPoint(p));
    }
}

CalibratedMechanics.prototype.addOutputs = function(outputs)
{
    for (var i = 0; i < outputs.length; i++) {
        var p = outputs[i];
        this.ensurePointAdded(p);
        this.outputs[p] = true;
    }
}

CalibratedMechanics.prototype.solve = function(pointArray, paramsArray)
{
    for (var p in this.inputs) {
        if (p in pointArray) {
            this.mechanics.setFixedPointConstraint(this.getInputConstraintId(p), p, pointArray[p]);
        }
    }

    this.mechanics.solve();

    for (var p in this.outputs) {
        pointArray[p] = this.mechanics.getPoint(p);
    }
}
