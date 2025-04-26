import $ from "jquery"

function enable(value)
{
    return this.setViewMode(value, true)
}

function disable(value)
{
    return this.setViewMode(value, false)
}

function toggle(value)
{
    return this.setViewMode(value, "toggle")
}

function expansion(value)
{
    if (value !== null) {
        value = parseInt(value)
        if (isNaN(value)) {
            throw "expansion must be a number"
        }
        if (value < -100 || value > 100) {
            throw "expansion value must be between -100 and 100"
        }
        this.setExpansion(value/100)
    }

    var val = Math.round(this.getExpansion()*100).toString()
    var ec = $('#expansion-control')
    if (val != ec.val()) {
        ec.val(val)
    }
}

export default {enable, disable, toggle, expansion}
