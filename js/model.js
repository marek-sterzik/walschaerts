
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

    var wheelVOffset = ySize - trackSize - this.mainWheelRadius;

    this.leftWheelCenter = new Point(xOffset + this.mainWheelRadius, wheelVOffset);
    this.mainWheelCenter = new Point(this.leftWheelCenter.x + wheelCenterDistance, wheelVOffset);
    this.rightWheelCenter = new Point(this.leftWheelCenter.x + 2*wheelCenterDistance, wheelVOffset);

    wheelVOffset = ySize - trackSize - this.smallWheelRadius;
    this.smallWheel1Center = new Point(492, wheelVOffset);
    this.smallWheel2Center = new Point(665, wheelVOffset);
    this.recalc();
}

ValveGearModel.prototype.addDistance = function(distance)
{
    this.mainWheelAngle = this._recalcAngle(this.mainWheelAngle, this.mainWheelRadius, distance);
    this.smallWheelAngle = this._recalcAngle(this.smallWheelAngle, this.smallWheelRadius, distance);
    this.recalc();
}

ValveGearModel.prototype._recalcAngle = function(originalAngle, radius, distance)
{
    return this._normalizeAngle(originalAngle - (distance / radius));
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
}
