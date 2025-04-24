import {PathArray} from '@svgdotjs/svg.js'

export default new class
{
    initialize(state)
    {
        state.state.component = null
    }

    normalizeDef(def)
    {
        return def
    }

    enablePointMode(state)
    {
        const pathArray = this.getArcPathArray(state)
        const arc = state.svg.path(pathArray).stroke(state.def.stroke).fill('none')

        state.state.component = arc
    }

    disablePointMode(state)
    {
        state.state.component.remove()
        state.state.component = null
    }

    update(state)
    {
        if (state.state.component !== null) {
            const pathArray = this.getArcPathArray(state)
            state.state.component.plot(pathArray)
        }
    }

    needsUpdate(state)
    {
        return (state.state.component !== null) ? true : false
    }

    getArcPathArray(state)
    {
        const pFrom = state.model(state.def.from)
        const pTo = state.model(state.def.to)
        const pCenter = state.model(state.def.center)

        const radius = pCenter.vectorTo(pFrom).size()

        return new PathArray([
            ['M', pFrom.x, pFrom.y],
            ['A', radius, radius, 0, 0, state.def.clockwise ? 1 : 0, pTo.x, pTo.y],
        ])
    }
}
