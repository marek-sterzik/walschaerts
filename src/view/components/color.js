import {Point, Vector, Transformation} from "eeg2d"
import {setTransform} from "../../util/transform.js"

const normalizeValue = (value) => {
    if (isNaN(value)) {
        value = 0
    }
    if (value < -1) {
        value = -1
    } else if (value > 1) {
        value = 1
    }
    return value
}

const getColorByValue = (value) => (value < 0) ? '#0000ff' : '#ff0000'

const getOpacityByValue = (value) => Math.abs(value) * 0.5

class Color
{
    constructor(type)
    {
        if (type === 'rect') {
            this.css = (color, opacity) => ({"fill": color, "fill-opacity": opacity})
        } else if (type === 'gradient') {
            this.css = (color, opacity) => ({"stop-color": color, "stop-opacity": opacity})
        } else {
            throw `Invalid color type: ${type}`
        }
    }

    initialize(state)
    {
        const components = state.svg.find("#" + state.def.component)
        state.state.component = (components.length > 0) ? components[0] : null
    }

    normalizeDef(def)
    {
        return def
    }

    enable(state)
    {
    }

    disable(state)
    {
        this.setToValue(state, null)
    }

    update(state)
    {
        this.setToValue(state, state.model(state.def.value))
    }

    setToValue(state, value)
    {
        value = normalizeValue(value)
        const color = getColorByValue(value)
        const opacity = getOpacityByValue(value)

        if (state.state.component !== null) {
            state.state.component.css(this.css(color, opacity))
        }
    }
}

export default {rect: new Color("rect"), gradient: new Color("gradient")}
