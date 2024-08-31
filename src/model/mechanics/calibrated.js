import Mechanics from "../../old/mechanics.js"

export default class
{
    constructor(calibrationData)
    {
        this.mechanics = new Mechanics;
        this.statistics = this.mechanics.statistics;
        this.calibrationData = calibrationData;
        this.inputs = {};
        this.outputs = {};
        this.constraintCounter = 0;

    }

    getNextConstraintId()
    {
        return "constraint_"+(this.constraintCounter++);
    }

    getInputConstraintId(pointId)
    {
        return "input_"+pointId;
    }

    ensurePointAdded(pointId)
    {
        if (!this.mechanics.isPointSet(pointId)) {
            this.mechanics.setPoint(pointId, this.getCalibrationPoint(pointId));
        }
    }

    getCalibrationPoint(pointId)
    {
        return this.calibrationData[pointId];
    }

    addDistanceConstraints(distanceConstraints)
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

    addLineConstraints(lineConstraints)
    {
        for (var i = 0; i < lineConstraints.length; i++) {
            var p = lineConstraints[i][0];
            var v = lineConstraints[i][1];
            
            this.ensurePointAdded(p);
            this.mechanics.setLineConstraint(this.getNextConstraintId(), p, this.getCalibrationPoint(p), v);
        }
    }

    addFixedPointConstraints(fixedPointConstraints)
    {
        for (var i = 0; i < fixedPointConstraints.length; i++) {
            var p = fixedPointConstraints[i];
            this.ensurePointAdded(p);
            this.mechanics.setFixedPointConstraint(this.getNextConstraintId(), p, this.getCalibrationPoint(p));
        }
    }

    addInputs(inputs)
    {
        for (var i = 0; i < inputs.length; i++) {
            var p = inputs[i];
            this.ensurePointAdded(p);
            this.inputs[p] = true;
            this.mechanics.setFixedPointConstraint(this.getInputConstraintId(p), p, this.getCalibrationPoint(p));
        }
    }

    addOutputs(outputs)
    {
        for (var i = 0; i < outputs.length; i++) {
            var p = outputs[i];
            this.ensurePointAdded(p);
            this.outputs[p] = true;
        }
    }

    solve(pointArray, paramsArray)
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
}
