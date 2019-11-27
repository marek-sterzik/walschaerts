function ValveGearModel ()
{
    var xSize = 700;
    var ySize = 222;
    var trackSize = 3;
    var xOffset = 4;
    var wheelCenterDistance = 149;

    this.mainWheelRadius = 70;
    this.smallWheelRadius = 33;

    //points which will contain points of the valve gear model
    this.points = {};

    //params contain other parameters of the valve gear model
    this.params = {
        "mainWheelAngle": 0,
        "smallWheelAngle": 0,
    };

    //points which are used for calibration of the mechanic model
    this.calibration = {};

    //the mechanic models itself
    this.mechanicModels = [];


    var wheelVOffset = ySize - trackSize - this.mainWheelRadius;

    this.points.leftWheelCenter = new Point(xOffset + this.mainWheelRadius, wheelVOffset);
    this.points.mainWheelCenter = new Point(this.points.leftWheelCenter.x + wheelCenterDistance, wheelVOffset);
    this.points.rightWheelCenter = new Point(this.points.leftWheelCenter.x + 2*wheelCenterDistance, wheelVOffset);

    wheelVOffset = ySize - trackSize - this.smallWheelRadius;
    this.points.smallWheel1Center = new Point(492, wheelVOffset);
    this.points.smallWheel2Center = new Point(665, wheelVOffset);

    this.wheelConnectPointRadius = 30;
    this.returnCrankConnectPointRadius = 23;

    this._setupCalibration();

    this._setupModel1();
    this._setupModel2();
    this._setupModel3();
    this._setupModel4();

    this.recalc();
}

ValveGearModel.prototype.addDistance = function(distance)
{
    this.params.mainWheelAngle = this._recalcAngle(this.params.mainWheelAngle, this.mainWheelRadius, distance);
    this.params.smallWheelAngle = this._recalcAngle(this.params.smallWheelAngle, this.smallWheelRadius, distance);
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

ValveGearModel.prototype._setupCalibration = function()
{
    var xSize = 700;
    var ySize = 222;
    var trackSize = 3;
    var xOffset = 4;
    var wheelCenterDistance = 149;

    this.mainWheelRadius = 70;
    this.smallWheelRadius = 33;
    
    var wheelVOffset = ySize - trackSize - this.mainWheelRadius;

    this.calibration.leftWheelCenter = new Point(xOffset + this.mainWheelRadius, wheelVOffset);
    this.calibration.mainWheelCenter = new Point(this.points.leftWheelCenter.x + wheelCenterDistance, wheelVOffset);
    this.calibration.rightWheelCenter = new Point(this.points.leftWheelCenter.x + 2*wheelCenterDistance, wheelVOffset);

    wheelVOffset = ySize - trackSize - this.smallWheelRadius;
    this.calibration.smallWheel1Center = new Point(492, wheelVOffset);
    this.calibration.smallWheel2Center = new Point(665, wheelVOffset);
    
    var v1 = new Vector(0, 1);
    v1 = v1.mul(this.wheelConnectPointRadius);
    var v2 = new Vector(1, 0);
    v2 = v2.mul(this.returnCrankConnectPointRadius);

    this.calibration.leftWheelConnectPoint = this.calibration.leftWheelCenter.addVector(v1);
    this.calibration.mainWheelConnectPoint = this.calibration.mainWheelCenter.addVector(v1);
    this.calibration.rightWheelConnectPoint = this.calibration.rightWheelCenter.addVector(v1);
    this.calibration.returnCrankConnectPoint = this.calibration.mainWheelCenter.addVector(v2);

    //setup the calibration points itself
    this.calibration.mainWheelConnectPoint = this.calibration.mainWheelConnectPoint;
    this.calibration.returnCrankConnectPoint = this.calibration.returnCrankConnectPoint;
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
}


ValveGearModel.prototype._setupModel1 = function()
{
    var model = new WheelModel(this.calibration);
    this.mechanicModels.push(model);

    model.addWheel("mainWheelAngle", "leftWheelCenter", ["leftWheelCenter", "leftWheelConnectPoint"]);
    model.addWheel("mainWheelAngle", "mainWheelCenter", ["mainWheelCenter", "mainWheelConnectPoint", "returnCrankConnectPoint"]);
    model.addWheel("mainWheelAngle", "rightWheelCenter", ["rightWheelCenter", "rightWheelConnectPoint"]);
    model.addWheel("smallWheelAngle", "smallWheel1Center", ["smallWheel1Center"]);
    model.addWheel("smallWheelAngle", "smallWheel2Center", ["smallWheel2Center"]);
}


ValveGearModel.prototype._setupModel2 = function()
{
    var pistonMoveDirection = new Vector(1, 0);

    var model = new CalibratedMechanics(this.calibration);
    this.mechanicModels.push(model);
    this.mStat = model.statistics;

    model.addDistanceConstraints([
        ["returnCrankConnectPoint", "expansionLinkConnectPoint"],
        ["expansionLinkConnectPoint", "expansionLinkFixed"],
        ["mainWheelConnectPoint", "pistonConnectPoint"]
    ]);

    model.addLineConstraints([
        ['pistonConnectPoint', pistonMoveDirection],
        ['pistonCenter', pistonMoveDirection]
    ]);

    model.addFixedPointConstraints(['expansionLinkFixed']);

    model.addInputs(['returnCrankConnectPoint', 'mainWheelConnectPoint']);

    model.addOutputs([
        'expansionLinkFixed',
        'expansionLinkConnectPoint',
        'pistonConnectPoint',
        'pistonCenter',
        'pistonUnionLinkConnectPoint',
    ]);
}

ValveGearModel.prototype._setupModel3 = function()
{
    var model = new TranslationMechanics(this.calibration);
    this.mechanicModels.push(model);

    model.setInput('pistonConnectPoint');
    model.setOutputs(['pistonCenter', 'pistonUnionLinkConnectPoint']);
}

ValveGearModel.prototype._setupModel4 = function()
{
    var model = new WheelModel(this.calibration);
    this.mechanicModels.push(model);

    model.addPointDrivenWheel("expansionLinkConnectPoint", "expansionLinkFixed",
                              ["expansionLinkTopEnd", "expansionLinkBottomEnd", "expansionLinkRadiusCenter"]);
}

ValveGearModel.prototype.recalc = function()
{
    for (var i = 0; i < this.mechanicModels.length; i++) {
        var model = this.mechanicModels[i];
        model.solve(this.points, this.params);
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
