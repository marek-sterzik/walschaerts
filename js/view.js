
function ValveGearView (model, svg)
{
    this.model = model;
    this.svg = svg;
    this.initialize();
    this.update();
}

ValveGearView.prototype.initialize = function()
{
    var p1 = new Point(0, 0);
    var p2 = new Point(this.svg.width(), this.svg.height());
    

    this.leftWheel = this._circle(this.model.leftWheelCenter, this.model.mainWheelRadius).fill('transparent').stroke({color: "red", width: 2});
    this.mainWheel = this._circle(this.model.mainWheelCenter, this.model.mainWheelRadius).fill('transparent').stroke({color: "red", width: 2});
    this.rightWheel = this._circle(this.model.rightWheelCenter, this.model.mainWheelRadius).fill('transparent').stroke({color: "red", width: 2});
    this.smallWheel1 = this._circle(this.model.smallWheel1Center, this.model.smallWheelRadius).fill('transparent').stroke({color: "red", width: 2});
    this.smallWheel1 = this._circle(this.model.smallWheel2Center, this.model.smallWheelRadius).fill('transparent').stroke({color: "red", width: 2});

}

ValveGearView.prototype._circle = function(center, radius)
{
    var circle = this.svg.circle(radius * 2).move(center.x - radius, center.y - radius);
    return circle;
}

ValveGearView.prototype.update = function()
{
    //this.line.stroke({color: 'green'});
    //$(this.line).attr("stroke", "green");
}


