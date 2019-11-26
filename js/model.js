function ValveGearModel ()
{
    this.mainWheelAngle = 0;
    this.smallWheelAngle = 0;

    var xSize = 700;
    var ySize = 222;
    var trackSize = 3;
    var xOffset = 4;
    var wheelCenterDistance = 149;

    this.mainWheelRadius = 70;
    this.smallWheelRadius = 33;

    //points which will contain points of the valve gear model
    this.points = {};

    //points which are used for calibration of the mechanic model
    this.calibration = {};

    //array of structures containing the distance constraints of the mechanic model
    this.distances = [];

    //array of fixed point constraints of the mechanic model
    this.fixedPoints = [];

    //array of lineConstraints constraints of the mechanic model
    this.lineConstraints = [];

    //array of point ids being copied out of the mechanic model
    this.outputPoints = [];

    //the mechanic model itself
    this.mechanics = new Mechanics();

    this.mStat = this.mechanics.statistics;

    var wheelVOffset = ySize - trackSize - this.mainWheelRadius;

    this.points.leftWheelCenter = new Point(xOffset + this.mainWheelRadius, wheelVOffset);
    this.points.mainWheelCenter = new Point(this.points.leftWheelCenter.x + wheelCenterDistance, wheelVOffset);
    this.points.rightWheelCenter = new Point(this.points.leftWheelCenter.x + 2*wheelCenterDistance, wheelVOffset);

    wheelVOffset = ySize - trackSize - this.smallWheelRadius;
    this.points.smallWheel1Center = new Point(492, wheelVOffset);
    this.points.smallWheel2Center = new Point(665, wheelVOffset);

    this.wheelConnectPointRadius = 30;
    this.returnCrankConnectPointRadius = 23;

    this._calcWheelConnectPoints();
    this._setupCalibration();
    this._initializeMechanics();
    this._solveMechanics();
}

ValveGearModel.prototype.addDistance = function(distance)
{
    this.mainWheelAngle = this._recalcAngle(this.mainWheelAngle, this.mainWheelRadius, distance);
    this.smallWheelAngle = this._recalcAngle(this.smallWheelAngle, this.smallWheelRadius, distance);
    this.recalc();
}

ValveGearModel.prototype._recalcAngle = function(originalAngle, radius, distance)
{
    return this._normalizeAngle(originalAngle + (distance / radius));
}

ValveGearModel.prototype._normalizeAngle = function(angle)
{
    var c = 2 * Math.PI;
    while (angle < 0) {
        angle += c;
    }

    while (angle >= c) {
        angle -= c;
    }

    return angle;
}

ValveGearModel.prototype.recalc = function()
{
    this._calcWheelConnectPoints();
    this._updateMechanics();
    this._solveMechanics();
}

ValveGearModel.prototype._calcWheelConnectPoints = function()
{
    var v1 = new Vector(0, 1);
    v1 = v1.rot(new Angle(this.mainWheelAngle)).mul(this.wheelConnectPointRadius);
    var v2 = new Vector(1, 0);
    v2 = v2.rot(new Angle(this.mainWheelAngle)).mul(this.returnCrankConnectPointRadius);

    this.points.leftWheelConnectPoint = this.points.leftWheelCenter.addVector(v1);
    this.points.mainWheelConnectPoint = this.points.mainWheelCenter.addVector(v1);
    this.points.rightWheelConnectPoint = this.points.rightWheelCenter.addVector(v1);
    this.points.returnCrankConnectPoint = this.points.mainWheelCenter.addVector(v2);
}

ValveGearModel.prototype._setupCalibration = function()
{
    //setup the calibration points itself
    this.calibration.mainWheelConnectPoint = this.points.mainWheelConnectPoint;
    this.calibration.returnCrankConnectPoint = this.points.returnCrankConnectPoint;
    this.calibration.expansionLinkFixed = new Point(360, 78);
    this.calibration.expansionLinkConnectPoint = new Point(370, 143);
    this.calibration.pistonConnectPoint = new Point(440, 149);
    this.calibration.pistonCenter = new Point(576, 149);
    this.calibration.pistonUnionLinkConnectPoint = new Point(440, 190);
    this.calibration.expansionLinkTopEnd = new Point(353, 48);
    this.calibration.expansionLinkBottomEnd = new Point(376, 107);

    //recalibrate the expansionLinkBottomEnd so that it has the same distance
    //from the fixed point as the top end
    var expansionLinkRange = this.calibration.expansionLinkFixed.vectorTo(this.calibration.expansionLinkTopEnd).size();
    var bottomRangeVector = this.calibration.expansionLinkFixed.vectorTo(this.calibration.expansionLinkBottomEnd);
    bottomRangeVector = bottomRangeVector.normalize().mul(expansionLinkRange);
    this.calibration.expansionLinkBottomEnd = this.calibration.expansionLinkFixed.addVector(bottomRangeVector);

    this.calibration.expansionLinkRadiusCenter = this.circleCenterFrom3Points(
        this.calibration.expansionLinkTopEnd,
        this.calibration.expansionLinkFixed,
        this.calibration.expansionLinkBottomEnd
    );

    var pistonMoveDirection = new Vector(1, 0);

    //setup all distance constraints
    this.distances.push(["returnCrankConnectPoint", "expansionLinkConnectPoint"]);
    this.distances.push(["expansionLinkConnectPoint", "expansionLinkFixed"]);
    this.distances.push(["mainWheelConnectPoint", "pistonConnectPoint"]);
    this.distances.push(["pistonConnectPoint", "pistonCenter"]);
    this.distances.push(["pistonConnectPoint", "pistonUnionLinkConnectPoint"]);
    this.distances.push(["pistonCenter", "pistonUnionLinkConnectPoint"]);
    
    /*
    this.distances.push(["expansionLinkTopEnd", "expansionLinkConnectPoint"]);
    this.distances.push(["expansionLinkBottomEnd", "expansionLinkConnectPoint"]);
    this.distances.push(["expansionLinkRadiusCenter", "expansionLinkConnectPoint"]);
    this.distances.push(["expansionLinkRadiusCenter", "expansionLinkTopEnd"]);
    this.distances.push(["expansionLinkRadiusCenter", "expansionLinkFixed"]);
    this.distances.push(["expansionLinkRadiusCenter", "expansionLinkBottomEnd"]);
    */
    
    //setup all fixed point constraints - second parameter means
    //if the constraint should be also updated
    this.fixedPoints.push(["expansionLinkFixed", false]);
    this.fixedPoints.push(["returnCrankConnectPoint", true]);
    this.fixedPoints.push(["mainWheelConnectPoint", true]);

    //setup all line constraints
    this.lineConstraints.push(["pistonConnectPoint", pistonMoveDirection]);
    this.lineConstraints.push(["pistonCenter", pistonMoveDirection]);

    //setup output points
    this.outputPoints.push('expansionLinkFixed');
    this.outputPoints.push('expansionLinkConnectPoint');
    this.outputPoints.push('pistonConnectPoint');
    this.outputPoints.push('pistonCenter');
    this.outputPoints.push('pistonUnionLinkConnectPoint');
}

ValveGearModel.prototype._initializeMechanics = function()
{
    for (var p in this.calibration) {
        this.mechanics.setPoint(p, this.calibration[p]);
    }

    for (var i = 0; i < this.distances.length; i++) {
        var distance = this.distances[i];
        var p1 = distance[0];
        var p2 = distance[1];
        var distance = this.calibration[p1].vectorTo(this.calibration[p2]).size();
        this.mechanics.setDistanceConstraint("_distanceConstraint"+i, p1, p2, distance);
    }

    var updatedFixedPoints = [];
    for (var i = 0; i < this.fixedPoints.length; i++) {
        var p = this.fixedPoints[i][0];
        var update = this.fixedPoints[i][1];
        this.mechanics.setFixedPointConstraint(p, p, this.calibration[p]);
        if (update) {
            updatedFixedPoints.push(this.fixedPoints[i]);
        }
    }

    for (var i = 0; i < this.lineConstraints.length; i++) {
        var lc = this.lineConstraints[i];
        var p = lc[0];
        var vector = lc[1];
        this.mechanics.setLineConstraint("_lineConstraint"+i, p, this.calibration[p], vector);
    }

    this.fixedPoints = updatedFixedPoints;
}

ValveGearModel.prototype._updateMechanics = function()
{
    for (var i = 0; i < this.fixedPoints.length; i++) {
        var p = this.fixedPoints[i][0];
        this.mechanics.setFixedPointConstraint(p, p, this.points[p]);
    }
}

ValveGearModel.prototype._solveMechanics = function()
{
    this.mechanics.solve();

    for (var i = 0; i < this.outputPoints.length; i++) {
        var p = this.outputPoints[i];
        this.points[p] = this.mechanics.getPoint(p);
    }
}

ValveGearModel.prototype.circleCenterFrom3Points = function(a, b, c)
{
    var va = b.vectorTo(a);
    var vb = b.vectorTo(c);
    var A = b.addVector(va.mul(.5));
    var B = b.addVector(vb.mul(.5));

    var matrix = [
        [va.x, va.y, va.x * A.x + va.y * A.y],
        [vb.x, vb.y, vb.x * B.x + vb.y * B.y]
    ];

    var solution = this.solve2Matrix(matrix);

    return new Point(solution[0], solution[1]);
}


ValveGearModel.prototype.solve2Matrix = function(matrix)
{
    if (Math.abs(matrix[0][0]) < Math.abs(matrix[1][0])) {
        var x = matrix[0];
        matrix[0] = this.matrixLinearCombination(matrix, [1/matrix[0][0], 0]);
        matrix[1] = this.matrixLinearCombination(matrix, [-matrix[1][0], 1]);
        matrix[1] = this.matrixLinearCombination(matrix, [0, 1/matrix[1][1]]);
        matrix[0] = this.matrixLinearCombination(matrix, [1, -matrix[0][1]]);
    }

    return [matrix[0][2], matrix[1][2]];
}

ValveGearModel.prototype.matrixLinearCombination = function (matrix, lineCoefficients)
{
    var rows = matrix.length;
    var columns = matrix[0].length;
    var finalVector = [];
    for (var j = 0; j < columns; j++) {
        finalVector[j] = 0;
    }
    
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < columns; j++) {
            finalVector[j] += lineCoefficients[i] * matrix[i][j];
        }
    }

    return finalVector;
}
