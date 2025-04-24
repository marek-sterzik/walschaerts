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
        const point = state.model(state.def.name)
        const group = state.svg.group()
        const size = 3.5
        group.line(-size, -size, size, size).stroke(state.def.stroke)
        group.line(-size, size, size, -size).stroke(state.def.stroke)
        group.center(point.x, point.y)
        state.state.component = group
    }

    disablePointMode(state)
    {
        state.state.component.remove()
        state.state.component = null
    }

    update(state)
    {
        if (state.state.component !== null) {
            const point = state.model(state.def.name)
            state.state.component.center(point.x, point.y)
        }
    }

    needsUpdate(state)
    {
        return (state.state.component !== null) ? true : false
    }
}
