function Mechanics()
{
    this.maxIterations = 1000;
    this.maxError = 0.01;
    this.globalConstraintWeight = .93;
    this.points = {};
    this.constraints = {};
    this.bindings = {};

    this.meanValuesSteps = 20;
    this.statistics = {};
}

Mechanics.prototype.setPoint = function (id, point)
{
    this.points[id] = point.copy();
}

Mechanics.prototype.getPoint = function (id)
{
    return this.points[id];
}

Mechanics.prototype.isPointSet = function (id)
{
    return (id in this.points) ? true : false;
}

Mechanics.prototype.setConstraint = function (id, forcesFunction)
{
    if (! (id in this.constraints)) {
        this.constraints[id] = {'forcesFunction': forcesFunction, 'weight': null};
    } else {
        this.constraints[id]['forcesFunction'] = forcesFunction;
    }
}

Mechanics.prototype.setConstraintWeight = function (id, weight)
{
    if (! id in this.constraints) {
        this.constraints[id] = {'forcesFunction': null, 'weight': weight};
    } else {
        this.constraint[id]['weight'] = weight;
    }
}

Mechanics.prototype.setFixedPointConstraint = function (id, idPoint, fixedPoint)
{
    this.setConstraint(id, function() {
        var forces = {};
        forces[idPoint] = this.getPoint(idPoint).vectorTo(fixedPoint);
        return forces;
    });
}

Mechanics.prototype.setDistanceConstraint = function (id, idPoint1, idPoint2, distance)
{
    this.setConstraint(id, function () {
        var distanceVector = this.getPoint(idPoint1).vectorTo(this.getPoint(idPoint2));
        var realDistance = distanceVector.size();
        distanceVector = distanceVector.normalize();
        if (distanceVector.x == 0 && distanceVector.y == 0) {
            distanceVector = new Vector(1, 0);
        }
        
        var forceVector = distanceVector.mul((realDistance - distance)/2);
        var forces = {};
        forces[idPoint1] = forceVector;
        forces[idPoint2] = forceVector.mul(-1);
        return forces;
    });
}

Mechanics.prototype.setLineConstraint = function (id, idPoint, linePoint, lineVector)
{
    var orthoVector = lineVector.rot(Angle.inDegrees(90)).normalize();
    this.setConstraint(id, function () {
        var p = this.getPoint(idPoint);
        var forces = {};
        forces[idPoint] = orthoVector.mul(p.vectorTo(linePoint).mulScalar(orthoVector));
        return forces;
    });
}

Mechanics.prototype.solve = function ()
{
    var t0 = performance.now();
    var error = this.solveIteration();
    var iterations = 1;
    while (error > this.maxError && iterations < this.maxIterations)
    {
        error = this.solveIteration();
        iterations++;
    }
    var t1 = performance.now();
    var solveTime = t1 - t0;
    this.putSolveStatistics(iterations, solveTime, error);
    return error;
}

Mechanics.prototype.solveIteration = function ()
{
    var maxForce = 0;
    var forces = {};
    for (var idPoint in this.points) {
        forces[idPoint] = Vector.zero();
    }

    for (var idConstraint in this.constraints) {
        var constraintForcesFunction = this.constraints[idConstraint]['forcesFunction'];
        var constraintWeight = this.constraints[idConstraint]['weight'];
        if (constraintWeight == null) {
            constraintWeight = this.globalConstraintWeight;
        }
        var partialForces = constraintForcesFunction.call(this);
        for (var pf in partialForces) {
            if (pf in forces) {
                var f = partialForces[pf];
                var fSize = f.size();
                if (fSize > maxForce) {
                    maxForce = fSize;
                }
                forces[pf] = forces[pf].add(f.mul(constraintWeight));
                fSize = forces[pf].size();
                if (fSize > maxForce) {
                    maxForce = fSize;
                }
            }
        }
    }

    for (var idPoint in this.points) {
        this.points[idPoint] = this.points[idPoint].addVector(forces[idPoint]);
    }

    return maxForce;
}

Mechanics.prototype.putSolveStatistics = function(iterations, solveTime, error)
{
    this.statistics['iterations'] = iterations;
    this.statistics['solveTime'] = solveTime;
    this.statistics['error'] = error;
}

export default Mechanics
