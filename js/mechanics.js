function Mechanics()
{
    this.maxIterations = 100;
    this.maxError = 0.01;
    this.globalConstraintWeight = 1;
    this.points = {};
    this.constraints = {};
    this.bindings = {};
}

Mechanics.prototype.setPoint = function (id, point)
{
    this.points[id] = point.copy();
}

Mechanics.prototype.getPoint = function (id)
{
    return this.points[id];
}

Mechanics.prototype.setConstraint = function (id, forcesFunction)
{
    if (! id in this.constraints) {
        this.constraints[id] = {'forcesFunction': forcesFunction, 'weight': null};
    } else {
        this.constraint[id]['forcesFunction'] = forcesFunction;
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
        return {
            idPoint: this.getPoint(idPoint).vectorTo(fixedPoint)
        }; 
    });
}

Mechanics.prototype.setDistanceConstraint = function (id, idPoint1, idPoint2, distance)
{
    this.setConstraint(id, function() {
        var distanceVector = this.getPoint(idPoint1).vectorTo(this.getPoint(idPoint2));
        var realDistance = distanceVector.size();
        distanceVector = distanceVector.normalize();
        if (distanceVector.x == 0 && distanceVector.y == 0) {
            distanceVector = new Vector(1, 0);
        }
        
        var forceVector = distanceVector.mul((realDistance - distance)/2);

        return {
            idPoint1: forceVector,
            idPoint2: forceVector.mul(-1),
        }; 
    });
}

Mechanics.prototype.setBinding = function (id, idPoint1, idPoint2, length)
{
    this.bindings[id] = {"point1": idPoint1, "point2": idPoint2, "length": length}
}

Mechanics.prototype.solve = function ()
{
    var error = this.solveIteration();
    iterations = 1;
    while (error > this.maxError && iterations < this.maxIterations)
    {
        error = this.solveIteration();
        iterations++;
    }
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
                forces[pf] = forces[pf].addVector(f.mul(weight));
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
