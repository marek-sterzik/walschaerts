import {Point, Vector, Transformation} from "eeg2d"
import {setTransform} from "../../util/transform.js"

export default new class
{
    initialize(state)
    {
        state.state.components = state.svg.find("#" + state.def.component)
        
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
        const p1Id = state.def.p1
        const p2Id = state.def.p2
        if (state.state.components.length > 0) {
            const component = state.state.components[0]
            const a1 = state.model("calibration." + state.def.p1)
            const b1 = state.model("calibration." + state.def.p2)
            const a2 = state.model(state.def.p1)
            const b2 = state.model(state.def.p2)
            const transformation = Transformation.twoPoint(a1, b1, a2, b2)
            setTransform(component, transformation)
        }
    }

    needsUpdate(state)
    {
        return true
    }
}
