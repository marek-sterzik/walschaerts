
function ValveGearView (model, svg)
{
    this.model = model;
    this.svg = svg;
    this.points = {};
    this.updatedPoints = {
        'leftWheelCenter': 'red',
        'mainWheelCenter': 'red',
        'rightWheelCenter': 'red',
        'smallWheel1Center': 'red',
        'smallWheel2Center': 'red',
        'leftWheelConnectPoint': 'blue',
        'mainWheelConnectPoint': 'blue',
        'rightWheelConnectPoint': 'blue',
        'returnCrankConnectPoint': 'blue',
    }
    
    this.initialize();
    //this.update();
}

ValveGearView.prototype.initialize = function()
{
    var p1 = new Point(0, 0);
    var p2 = new Point(this.svg.width(), this.svg.height());
    

    this.leftWheel = this._circle(this.model.leftWheelCenter, this.model.mainWheelRadius).fill('transparent').stroke({color: "red", width: 2});
    this.mainWheel = this._circle(this.model.mainWheelCenter, this.model.mainWheelRadius).fill('transparent').stroke({color: "red", width: 2});
    this.rightWheel = this._circle(this.model.rightWheelCenter, this.model.mainWheelRadius).fill('transparent').stroke({color: "red", width: 2});
    this.smallWheel1 = this._circle(this.model.smallWheel1Center, this.model.smallWheelRadius).fill('transparent').stroke({color: "red", width: 2});
    this.smallWheel2 = this._circle(this.model.smallWheel2Center, this.model.smallWheelRadius).fill('transparent').stroke({color: "red", width: 2});
    
    for (var p in this.updatedPoints) {
        this._putPoint(p, this.updatedPoints[p]);
    }
}

ValveGearView.prototype._circle = function(center, radius)
{
    var circle = this.svg.circle(radius * 2).move(center.x - radius, center.y - radius);
    return circle;
}

ValveGearView.prototype._putPoint = function(pointId, color)
{
    var point = this.model[pointId];
    var group = this.svg.group();
    var size = 7;
    group.line(-size, -size, size, size).stroke({color: color, width: 2});
    group.line(-size, size, size, -size).stroke({color: color, width: 2});
    group.center(point.x, point.y);
    this.points[pointId] = group;
}

ValveGearView.prototype._updatePoint = function(pointId)
{
    var point = this.model[pointId];
    this.points[pointId].center(point.x, point.y)
}

ValveGearView.prototype.update = function()
{
    for (var p in this.updatedPoints) {
        this._updatePoint(p);
    }
}


