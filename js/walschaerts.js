$(function () {
    setupCoords();
    walschaertsValveGear = new WalschaertsValveGear('#valvegear');
    $('#toggle-button').bind("click", function() {
        walschaertsValveGear.toggle();
        if (walschaertsValveGear.running()) {
            $(this).removeClass('play').addClass('pause');
        } else {
            $(this).removeClass('pause').addClass('play');
        }
    });

    setExpansion("");
    $('#expansion-control').bind('change', function() {
        setExpansion($(this).val());
    });

    $('#expansion_set_100').bind('click', function() {
        setExpansion('100');
    });
    $('#expansion_set_0').bind('click', function() {
        setExpansion('0');
    });
    $('#expansion_set_minus_100').bind('click', function() {
        setExpansion('-100');
    });
});

function setExpansion(value)
{
    if (!isNaN(parseInt(value))) {
        walschaertsValveGear.setExpansion(parseInt(value)/100);
    }

    var val = Math.round(walschaertsValveGear.getExpansion()*100).toString();
    var ec = $('#expansion-control');
    if (val != ec.val()) {
        ec.val(val);
    }

}


function setupCoords()
{
    var emptyText = "coordinates: out of the box";
    $('#coords').html(emptyText);
    $('#valvegear').bind("mousemove", function(ev){
        var offset = $(this).offset();
        var x;
        var y;
        x = ev.pageX - Math.floor(offset.left);
        y = ev.pageY - Math.floor(offset.top);
        $('#coords').html("coordinates: x=<strong>"+x+"</strong> y=<strong>"+y+"</strong>");
    });
    $('#valvegear').bind("mouseout", function(ev){
        $('#coords').html(emptyText);
    });
}

function WalschaertsValveGear(element)
{
    var THIS = this;
    var svg = SVG().addTo(element).size('100%', '100%');
    this.model = new ValveGearModel(0);
    this.expansion = this.model.getExpansion();
    this.view = new ValveGearView(this.model, svg);
    this.statView = new StatView(this.model, $('#statistics'));
    this.interval = null;
    this.speed = 30;
    this.expansionChangingSpeed = 0.3;
    this.expansionTolerance = 0.0001;
    this.interval = setInterval(function() {
        THIS.stepFunction();
    }, 100);
    this.runFlag = false;
    
}

WalschaertsValveGear.prototype.toggle = function()
{
    this.runFlag = !this.runFlag;
}

WalschaertsValveGear.prototype.running = function()
{
    if (this.interval != null) {
        return true;
    } else {
        return false;
    }
}

WalschaertsValveGear.prototype.setExpansion = function(expansion)
{
    if (expansion < -1) {
        expansion = -1;
    }else if (expansion > 1) {
        expansion = 1;
    }
    this.expansion = expansion;
    return this;
}

WalschaertsValveGear.prototype.getExpansion = function()
{
    return this.expansion;
}

WalschaertsValveGear.prototype.stepFunction = function()
{
    var s1 = this.updateDistance();
    var s2 = this.updateExpansion();
    if (s1 || s2) {
        this.view.update();
        this.statView.update();
    }
}

WalschaertsValveGear.prototype.updateDistance = function()
{
    if (this.runFlag) {
        this.model.addDistance(30);
        return true;
    }
    return false;
}

WalschaertsValveGear.prototype.updateExpansion = function()
{
    var realExpansion = this.model.getExpansion();

    if (Math.abs(realExpansion - this.expansion) > this.expansionTolerance) {
        if (realExpansion > this.expansion) {
            realExpansion -= this.expansionChangingSpeed;
            if (realExpansion < this.expansion) {
                realExpansion = this.expansion;
            }
        }else {
            realExpansion += this.expansionChangingSpeed;
            if (realExpansion > this.expansion) {
                realExpansion = this.expansion;
            }
        }
        this.model.setExpansion(realExpansion);
        return true;
    }
    return false;
    
}


