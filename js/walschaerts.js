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
});


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
        $('#coords').html("coordinates: x="+x+" y="+x);
    });
    $('#valvegear').bind("mouseout", function(ev){
        $('#coords').html(emptyText);
    });
}

function WalschaertsValveGear(element)
{
    var svg = SVG().addTo(element).size('100%', '100%');
    this.model = new ValveGearModel(0);
    this.view = new ValveGearView(this.model, svg);
    this.interval = null;
    this.speed = 30;
    
}

WalschaertsValveGear.prototype.toggle = function()
{
    var THIS = this;
    if (this.interval == null) {
        this.interval = setInterval(function() {
            THIS.stepFunction();
        }, 100);
    } else {
        clearInterval(this.interval);
        this.interval = null;
    }
}

WalschaertsValveGear.prototype.running = function()
{
    if (this.interval != null) {
        return true;
    } else {
        return false;
    }
}

WalschaertsValveGear.prototype.stepFunction = function()
{
    this.model.addDistance(30);
    this.view.update();
    
}


