import {Point} from "./geometry.js"
import { PathArray } from '@svgdotjs/svg.js'

function ValveGearView (model, svg)
{
    this.model = model;
    this.svg = svg;
    this.points = {};
    this.lines = {};
    this.arcs = {};

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
        'expansionLinkFixed': {color: 'cyan', width: 2},
        'expansionLinkConnectPoint': {color: 'blue', width: 2},
        'crossheadConnectPoint': {color: 'magenta', width: 2},
        'pistonCenter': {color: 'magenta', width: 2},
        'pistonUnionLinkConnectPoint': {color: 'magenta', width: 2},
        'expansionLinkTopEnd': {color: 'cyan', width: 2},
        'expansionLinkBottomEnd': {color: 'cyan', width: 2},
        'expansionLinkRadiusCenter': {color: 'cyan', width: 2},
        'reverseArmCenter': {color: 'orange', width: 2},
        'reverseArmA': {color: 'orange', width: 2},
        'reverseArmB': {color: 'orange', width: 2},
        'reachRodEnd': {color: 'orange', width: 2},
        'calibration.radiusBarA': {color: 'green', width: 2},
        'calibration.combinationLeverA': {color: 'green', width: 2},
        'calibration.combinationLeverB': {color: 'green', width: 2},
        'calibration.valveCenter': {color: 'green', width: 2},
        'calibration.valveConnectPoint': {color: 'green', width: 2},
        'calibration.expansionLinkRadiusRod': {color: 'green', width: 2},
    };

    this.updatedLines = {
        "returnCrank": {"p1": "mainWheelConnectPoint", "p2": "returnCrankConnectPoint", "stroke": {color: "blue", width: 3}},
        "couplinkRod": {"p1": "leftWheelConnectPoint", "p2": "rightWheelConnectPoint", "stroke": {color: "blue", width: 5}},
        "eccentricRod": {"p1": "returnCrankConnectPoint", "p2": "expansionLinkConnectPoint", "stroke": {color: "blue", width: 3}},
        "reverseArm1": {"p1": "reverseArmA", "p2": "reverseArmCenter", "stroke": {color: "orange", width: 4}},
        "reverseArm2": {"p1": "reverseArmB", "p2": "reverseArmCenter", "stroke": {color: "orange", width: 4}},
        "reachRod": {"p1": "reachRodEnd", "p2": "reverseArmB", "stroke": {color: "orange", width: 4}},
        "expansionLink1": {"p1": "expansionLinkConnectPoint", "p2": "expansionLinkBottomEnd", "stroke": {color: "blue", width: 3}},
        "pistonRod": {"p1": "mainWheelConnectPoint", "p2": "crossheadConnectPoint", "stroke": {color: "magenta", width: 6}},
        "piston": {"p1": "crossheadConnectPoint", "p2": "pistonCenter", "stroke": {color: "magenta", width: 6}},
        "piston2": {"p1": "crossheadConnectPoint", "p2": "pistonUnionLinkConnectPoint", "stroke": {color: "magenta", width: 3}},
    };

    this.updatedArcs = {
        "expansionLink2": {"from": "expansionLinkTopEnd", "to": "expansionLinkBottomEnd", "clokwise": false, "center": "expansionLinkRadiusCenter", "stroke": {color: "cyan", width: 4}},
    };
    
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

    for (var a in this.updatedArcs) {
        this._putArc(a, this.updatedArcs[a]);
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

ValveGearView.prototype._putArc = function(arcId, arcDef)
{
    var pathArray = this._getArcPathArray(arcDef);
    var arc = this.svg.path(pathArray).stroke(arcDef.stroke).fill('none');
    this.arcs[arcId] = arc;
}

ValveGearView.prototype._getArcPathArray = function(arcDef)
{
    var pFrom = this.getModelPoint(arcDef.from);
    var pTo = this.getModelPoint(arcDef.to);
    var pCenter = this.getModelPoint(arcDef.center);

    var radius = pCenter.vectorTo(pFrom).size();

    return new PathArray([
        ['M', pFrom.x, pFrom.y],
        ['A', radius, radius, 0, 0, arcDef.clokwise ? 1 : 0, pTo.x, pTo.y],
    ]);
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

ValveGearView.prototype._updateArc = function(arcId, arcDef)
{
    var pathArray = this._getArcPathArray(arcDef);
    this.arcs[arcId].plot(pathArray);
}


ValveGearView.prototype.update = function()
{
    for (var p in this.updatedPoints) {
        this._updatePoint(p);
    }
    for (var l in this.updatedLines) {
        this._updateLine(l, this.updatedLines[l]);
    }
    for (var a in this.updatedArcs) {
        this._updateArc(a, this.updatedArcs[a]);
    }
}

export default ValveGearView
