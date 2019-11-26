
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
        'expansionLinkFixed': {color: 'blue', width: 2},
        'expansionLinkEnd': {color: 'blue', width: 2},
        'pistonConnectPoint': {color: 'blue', width: 2},
        'pistonCenter': {color: 'blue', width: 2},
        'pistonUnionLinkConnectPoint': {color: 'blue', width: 2},
    }

    this.updatedLines = {
        "returnCrank": {"p1": "mainWheelConnectPoint", "p2": "returnCrankConnectPoint", "stroke": {color: "blue", width: 3}},
        "couplinkRod": {"p1": "leftWheelConnectPoint", "p2": "rightWheelConnectPoint", "stroke": {color: "blue", width: 5}},
        "eccentricRod": {"p1": "returnCrankConnectPoint", "p2": "expansionLinkEnd", "stroke": {color: "blue", width: 3}},
        "expansionLink": {"p1": "expansionLinkEnd", "p2": "expansionLinkFixed", "stroke": {color: "blue", width: 3}},
        "pistonRod": {"p1": "mainWheelConnectPoint", "p2": "pistonConnectPoint", "stroke": {color: "blue", width: 6}},
        "piston": {"p1": "pistonConnectPoint", "p2": "pistonCenter", "stroke": {color: "blue", width: 6}},
        "piston2": {"p1": "pistonConnectPoint", "p2": "pistonUnionLinkConnectPoint", "stroke": {color: "blue", width: 3}},
    }
    
    this.initialize();
    //this.update();
}

ValveGearView.prototype.initialize = function()
{
    var p1 = new Point(0, 0);
    var p2 = new Point(this.svg.width(), this.svg.height());
    

    this.leftWheel = this._circle(this.getModelPoint('leftWheelCenter'), this.model.mainWheelRadius).fill('transparent').stroke({color: "red", width: 2});
    this.mainWheel = this._circle(this.getModelPoint('mainWheelCenter'), this.model.mainWheelRadius).fill('transparent').stroke({color: "red", width: 2});
    this.rightWheel = this._circle(this.getModelPoint('rightWheelCenter'), this.model.mainWheelRadius).fill('transparent').stroke({color: "red", width: 2});
    this.smallWheel1 = this._circle(this.getModelPoint('smallWheel1Center'), this.model.smallWheelRadius).fill('transparent').stroke({color: "red", width: 2});
    this.smallWheel2 = this._circle(this.getModelPoint('smallWheel2Center'), this.model.smallWheelRadius).fill('transparent').stroke({color: "red", width: 2});
    
    for (var p in this.updatedPoints) {
        this._putPoint(p, this.updatedPoints[p]);
    }

    for (var l in this.updatedLines) {
        this._putLine(l, this.updatedLines[l]);
    }
}

ValveGearView.prototype.getModelPoint = function(pointId)
{
    var splitted = pointId.split(/\./, 2);
    var group;
    if (splitted.length < 2) {
        group = 'points';
    } else {
        group = splitted[0];
        pointId = splitted[1];
    }
    return this.model[group][pointId];
}

ValveGearView.prototype._circle = function(center, radius)
{
    var circle = this.svg.circle(radius * 2).move(center.x - radius, center.y - radius);
    return circle;
}

ValveGearView.prototype._putPoint = function(pointId, stroke)
{
    var point = this.getModelPoint(pointId);
    var group = this.svg.group();
    var size = 7;
    group.line(-size, -size, size, size).stroke(stroke);
    group.line(-size, size, size, -size).stroke(stroke);
    group.center(point.x, point.y);
    this.points[pointId] = group;
}

ValveGearView.prototype._putLine = function(lineId, lineDef)
{
    var p1 = this.getModelPoint(lineDef.p1);
    var p2 = this.getModelPoint(lineDef.p2);
    var line = this.svg.line(p1.x, p1.y, p2.x, p2.y).stroke(lineDef.stroke);
    this.lines[lineId] = line;
}

ValveGearView.prototype._updatePoint = function(pointId)
{
    var point = this.getModelPoint(pointId);
    this.points[pointId].center(point.x, point.y)
}

ValveGearView.prototype._updateLine = function(lineId, lineDef)
{
    var p1 = this.getModelPoint(lineDef.p1);
    var p2 = this.getModelPoint(lineDef.p2);
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

