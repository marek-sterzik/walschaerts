import $ from "jquery"
import WalschaertsValveGear from "./controller.js"

var walschaertsValveGear

$(function () {
    setupCoords()
    walschaertsValveGear = new WalschaertsValveGear('#valvegear')
    $('#toggle-button').bind("click", function() {
        walschaertsValveGear.toggle()
        if (walschaertsValveGear.running()) {
            $(this).removeClass('play').addClass('pause')
        } else {
            $(this).removeClass('pause').addClass('play')
        }
    })

    setExpansion("")
    $('#expansion-control').bind('change', function() {
        setExpansion($(this).val())
    })

    $('#expansion_set_100').bind('click', function() {
        setExpansion('100')
    })
    $('#expansion_set_0').bind('click', function() {
        setExpansion('0')
    })
    $('#expansion_set_minus_100').bind('click', function() {
        setExpansion('-100')
    })
})

function setExpansion(value)
{
    if (!isNaN(parseInt(value))) {
        walschaertsValveGear.setExpansion(parseInt(value)/100)
    }

    var val = Math.round(walschaertsValveGear.getExpansion()*100).toString()
    var ec = $('#expansion-control')
    if (val != ec.val()) {
        ec.val(val)
    }

}


function setupCoords()
{
    var emptyText = "coordinates: out of the box"
    $('#coords').html(emptyText)
    $('#valvegear').bind("mousemove", function(ev){
        var offset = $(this).offset()
        var x
        var y
        x = ev.pageX - Math.floor(offset.left)
        y = ev.pageY - Math.floor(offset.top)
        $('#coords').html("coordinates: x=<strong>"+x+"</strong> y=<strong>"+y+"</strong>")
    })
    $('#valvegear').bind("mouseout", function(ev){
        $('#coords').html(emptyText)
    })
}
