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

const getOpacityByValue = (value) => Math.abs(value) * 0.8

const rect = new class
{
    initialize(state)
    {
        const components = state.svg.find("#" + state.def.component)
        state.state.component = (components.length > 0) ? components[0] : null
    }

    normalizeDef(def)
    {
        return def
    }

    enablePointMode(state)
    {
    }

    disablePointMode(state)
    {
    }

    update(state)
    {
        const value = normalizeValue(state.model(state.def.value))
        const color = getColorByValue(value)
        const opacity = getOpacityByValue(value)

        if (state.state.component !== null) {
            state.state.component.fill({color, opacity})
            console.log(state.state.component)
        }
    }

    needsUpdate(state)
    {
        return true
    }
}

const gradient = new class
{
    initialize(state)
    {
        const components = state.svg.find("#" + state.def.component)
        state.state.component = (components.length > 0) ? components[0] : null
    }

    normalizeDef(def)
    {
        return def
    }

    enablePointMode(state)
    {
    }

    disablePointMode(state)
    {
    }

    update(state)
    {
        const value = normalizeValue(state.model(state.def.value))
        const color = getColorByValue(value)
        const opacity = getOpacityByValue(value)
    }

    needsUpdate(state)
    {
        return true
    }
}


export default {rect, gradient}
