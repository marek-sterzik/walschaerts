import {Point, Vector, Transformation} from "eeg2d"
import {setTransform, getParentTransform} from "../../util/transform.js"

export default new class
{
    initialize(state)
    {
        const components = state.svg.find("#" + state.def.component)
        state.state.component = (components.length > 0) ? components[0] : null
        if (state.state.component !== null) {
            state.state.parentTransform = getParentTransform(state.state.component)
            state.state.initialValues = {
                "x": state.state.component.x(),
                "y": state.state.component.y(),
                "width": state.state.component.width(),
                "height": state.state.component.height()
            }
        }
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
        if (state.state.component !== null) {
            const shift = state.model("calibration." + state.def.point).vectorTo(state.model(state.def.point))
            const values = {...state.state.initialValues}
            this.shiftValues(values, shift, state.def.edge)
            state.state.component.x(values.x).y(values.y).width(values.width).height(values.height)
        }
    }

    needsUpdate(state)
    {
        return true
    }

    shiftValues(values, shift, edge)
    {
        switch(edge)
        {
            case 'top':
                values.y += shift.y
                values.height -= shift.y
                break
            case 'bottom':
                values.height += shift.y
                break
            case 'left':
                values.x += shift.x
                values.width -= shift.x
                break
            case 'right':
                values.width += shift.x
                break
            default:
                throw `Invalid edge: ${edge}`
        }
    }

    getInitialParams(state, edge)
    {
        switch(edge)
        {
            case 'top':
            case 'bottom':
                return [state.state.component.y(), state.state.component.height()];
            case 'left':
            case 'right':
                return [state.state.component.x(), state.state.component.width()];
            default: throw `Invalid edge: ${edge}`
        }
    }
}

