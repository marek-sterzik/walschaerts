function Point(x, y)
{
    this.x = x
    this.y = y
}

Point.center = function()
{
    return new Point(0, 0);
}

Point.prototype.rot = function(p2, angle)
{
    return this.addVector(this.vectorTo(p2).rot(angle));
}

Point.prototype.addVector = function (v)
{
    return new Point (this.x + v.x, this.y + v.y);
}

Point.prototype.distance = function(p2)
{
    return this.vectorTo(p2).size();
}

Point.prototype.vectorTo = function(p2)
{
    var x = p2.x - this.x;
    var y = p2.y - this.y;
    return new Vector(x, y);
}

Point.prototype.coords = function()
{
    return [this.x, this.y];
}

Point.prototype.copy = function()
{
    return new Point(this.x, this.y);
}

function Vector(x, y)
{
    this.x = x
    this.y = y
}

Vector.zero = function () 
{
    return new Vector(0, 0);
}

Vector.prototype.transformation = function()
{
    return Transformation.translation(this);
}

Vector.prototype.size = function ()
{
    return Math.sqrt(this.mulScalar(this));
}

Vector.prototype.mulScalar = function(v)
{
    return (this.x * v.x) + (this.y * v.y);
}

Vector.prototype.mul = function (scalar)
{
    return new Vector (this.x * scalar, this.y * scalar);
}

Vector.prototype.add = function (v)
{
    return new Vector (this.x + v.x, this.y + v.y);
}

Vector.prototype.sub = function (v)
{
    return new Vector (this.x - v.x, this.y - v.y);
}

Vector.prototype.rot = function (angle)
{
    var cs = Math.cos(angle.rad());
    var sn = Math.sin(angle.rad());
    return new Vector (cs * this.x - sn * this.y, sn * this.x + cs * this.y);
}

Vector.prototype.normalize = function()
{
    var size = this.size();
    if (size > 0) {
        return new Vector(this.x/size, this.y/size);
    } else {
        return Vector.zero();
    }
}

Vector.prototype.angleTo = function(v)
{
    var angleRadians = Math.acos(this.mulScalar(v) / (this.size() * v.size()));
    if (this.x * v.y - this.y * v.x < 0) {
        angleRadians = 2*Math.PI - angleRadians;
    }

    return Angle.inRadians(angleRadians);
}

Vector.prototype.copy = function()
{
    return new Vector(this.x, this.y);
}

function Angle(radians)
{
    this.radians = radians;
}

Angle.zero = function()
{
    return new Angle(0);
}

Angle.inRadians = function (r)
{
    return new Angle(r);
}

Angle.inDegrees = function (d)
{
    return new Angle(d * Math.PI / 180);
}

Angle.prototype.rad = function ()
{
    return this.radians;
}

Angle.prototype.deg = function ()
{
    return this.radians * 180 / Math.PI;
}

Angle.prototype.mul = function (c)
{
    return new Angle(this.radians * c);
}

Angle.prototype.add = function (a2)
{
    return new Angle(this.radians + a2.radians);
}

Angle.prototype.transformation = function () 
{
    return Transformation.rotation(Point.center(), this);
}

Angle.prototype.copy = function()
{
    return new Angle(this.radians);
}


function Transformation(center, angle, translation)
{
    this.center = center;
    this.angle = angle;
    this.translation = translation;
}

Transformation.prototype.compose = function (t2)
{
    var center = this.center;
    var angle = this.angle.add(t2.angle);
    var cdiff = t2.center.vectorTo(this.center);
    var translation = cdiff.rot(t2.angle).sub(cdiff).add(this.translation.rot(t2.angle)).add(t2.translation);

    return new Transformation(center, angle, translation);
}

Transformation.prototype.inv = function ()
{
    var center = this.center;
    var angle = this.angle.mul(-1);
    var translation = this.translation.rot(this.angle.mul(-1)).mul(-1);

    return new Transformation(center, angle, translation);
}

Transformation.prototype.transformPoint = function (p)
{
    return this.center.rot(p, this.angle).addVector(this.translation);
}

Transformation.prototype.inverseTransformPoint = function (p)
{
    return this.center.rot(p.addVector(this.translation.mul(-1)), this.angle.mul(-1));
}

Transformation.prototype.pivotIn = function (c)
{
    return Transformation.rotation(c, Angle.zero()).compose(this);
}

Transformation.prototype.toString = function ()
{
    return "translate("+this.translation.x.toFixed(5)+","+this.translation.y.toFixed(5)+") rotate("+this.angle.deg().toFixed(5)+","+this.center.x.toFixed(5)+","+this.center.y.toFixed(5)+")";
}

Transformation.prototype.transformation = function ()
{
    return this;
}

Transformation.prototype.getPivot = function ()
{
    return this.center;
}

Transformation.prototype.getAngle = function ()
{
    return this.angle;
}

Transformation.prototype.getTranslation = function ()
{
    return this.translation;
}

Transformation.prototype.copy = function(center, angle, translation)
{
    return new Transformation(this.center, this.angle, this.translation);
}

Transformation._atomic = function(name, args)
{
    switch (name) {
    case 'rotate':
        if (args.length == 1) {
            args.push(0);
            args.push(0);
        }
        if (args.length != 3) {
            throw "rotate needs to have 1 or 3 arguments";
        }
        var angle = Angle.inDegrees(args[0]);
        var center = new Point(args[1], args[2]);
        return Transformation.rotation(center, angle);
    case 'translate':
        if (args.length != 2) {
            throw "translate needs to have 2 arguments";
        }
        var v = new Vector(args[0], args[1]);
        return Transformation.translation(v);
    default:
        throw "unknown atomic transformation: "+name;
    }
}

Transformation.fromString = function(str)
{
    str = str.trim();
    var transformation = Transformation.zero();
    while (str != "") {
        var match = str.match(/^([a-z]+)\s*\(([^\)]*)\)\s*(.*)/);
        if (!match) {
            throw "not a transformation";
        }

        var t = match[1];
        var args = match[2].split(/\s*,\s*/);
        str = match[3];

        var argsFinal = [];
        for (var i in args) {
            argsFinal.push(parseFloat(args[i].trim()));
        }

        transformation = Transformation._atomic(t, argsFinal).compose(transformation);
    }
    //TODO implement

    return transformation;
}

Transformation.rotation = function (center, angle)
{
    return new Transformation(center, angle, Vector.zero());
}

Transformation.zero = function()
{
    return new Transformation(Point.center(), Angle.zero(), Vector.zero());
}

Transformation.translation = function (v)
{
    return new Transformation(Point.center(), Angle.zero(), v);
}

