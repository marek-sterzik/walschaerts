import $ from "jquery"
import WalschaertsValveGear from "./controller.js"

var walschaertsValveGear

$(window).on("load", () => {
        console.log("start")
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
        $('#toggle-points').bind("click", function() {
            walschaertsValveGear.togglePoints()
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


