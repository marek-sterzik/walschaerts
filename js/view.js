
function ValveGearView (model, svg)
{
    this.model = model;
    this.svg = svg;
    this.points = {};
    this.lines = {};
    this.updatedPoints = {
        'leftWheelCenter': {color: 'red', width: 2},
        'mainWheelCenter': {color: 'red', width: 2},
        'rightWheelCenter': {color: 'red', width: 2},
        'smallWheel1Center': {color: 'red', width: 2},
        'smallWheel2Center': {color: 'red', width: 2},
        'leftWheelConnectPoint': {color: 'blue', width: 2},
        'mainWheelConnectPoint': {color: 'blue', width: 2},
        'rightWheelConnectPoint': {color: 'blue', width: 2},
        'returnCrankConnectPoint': {color: 'blue', width: 2},
    }

    this.updatedLines = {
        "returnCrank": {"p1": "mainWheelConnectPoint", "p2": "returnCrankConnectPoint", "stroke": {color: "blue", width: 3}},
        "couplinkRod": {"p1": "leftWheelConnectPoint", "p2": "rightWheelConnectPoint", "stroke": {color: "blue", width: 5}}
    }
    
    this.initialize();
    //this.update();
}

ValveGearView.prototype.initialize = function()
{
    var p1 = new Point(0, 0);
    var p2 = new Point(this.svg.width(), this.svg.height());
    

    this.leftWheel = this._circle(this.model.points.leftWheelCenter, this.model.mainWheelRadius).fill('transparent').stroke({color: "red", width: 2});
    this.mainWheel = this._circle(this.model.points.mainWheelCenter, this.model.mainWheelRadius).fill('transparent').stroke({color: "red", width: 2});
    this.rightWheel = this._circle(this.model.points.rightWheelCenter, this.model.mainWheelRadius).fill('transparent').stroke({color: "red", width: 2});
    this.smallWheel1 = this._circle(this.model.points.smallWheel1Center, this.model.smallWheelRadius).fill('transparent').stroke({color: "red", width: 2});
    this.smallWheel2 = this._circle(this.model.points.smallWheel2Center, this.model.smallWheelRadius).fill('transparent').stroke({color: "red", width: 2});
    
    for (var p in this.updatedPoints) {
        this._putPoint(p, this.updatedPoints[p]);
    }

    for (var l in this.updatedLines) {
        this._putLine(l, this.updatedLines[l]);
    }
}

ValveGearView.prototype._circle = function(center, radius)
{
    var circle = this.svg.circle(radius * 2).move(center.x - radius, center.y - radius);
    return circle;
}

ValveGearView.prototype._putPoint = function(pointId, stroke)
{
    var point = this.model.points[pointId];
    var group = this.svg.group();
    var size = 7;
    group.line(-size, -size, size, size).stroke(stroke);
    group.line(-size, size, size, -size).stroke(stroke);
    group.center(point.x, point.y);
    this.points[pointId] = group;
}

ValveGearView.prototype._putLine = function(lineId, lineDef)
{
    var p1 = this.model.points[lineDef.p1];
    var p2 = this.model.points[lineDef.p2];
    var line = this.svg.line(p1.x, p1.y, p2.x, p2.y).stroke(lineDef.stroke);
    this.lines[lineId] = line;
}

ValveGearView.prototype._updatePoint = function(pointId)
{
    var point = this.model.points[pointId];
    this.points[pointId].center(point.x, point.y)
}

ValveGearView.prototype._updateLine = function(lineId, lineDef)
{
    var p1 = this.model.points[lineDef.p1];
    var p2 = this.model.points[lineDef.p2];
    this.lines[lineId].plot(p1.x, p1.y, p2.x, p2.y);
}

ValveGearView.prototype.update = function()
{
    for (var p in this.updatedPoints) {
        this._updatePoint(p);
    }
    for (var l in this.updatedLines) {
        this._updateLine(l, this.updatedLines[l]);
    }
}


