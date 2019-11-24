$(function () {
    var svg = SVG().addTo('#valvegear').size('100%', '100%')
    initValveGear(svg);

    setupCoords();
});

function initValveGear(svg)
{
    model = new ValveGearModel(0);
    view = new ValveGearView(model, svg);
}


function setupCoords()
{
    $('#valvegear').bind("mousemove", function(ev){
        $('#coords').html("x="+ev.offsetX+" y="+ev.offsetY);
    });
    $('#valvegear').bind("mouseout", function(ev){
        $('#coords').html("");
    });
}
