export default new class
{
    initialize(state)
    {
        state.state.component = null
    }

    normalizeDef(def)
    {
        if (!("size" in def)) {
            def.size = 10
        }
        return def
    }

    enable(state)
    {
        const point = state.model(state.def.name)
        const group = state.svg.group()
        const size = 3.5 * state.def.size / 10
        group.line(-size, -size, size, size).stroke(state.def.stroke)
        group.line(-size, size, size, -size).stroke(state.def.stroke)
        group.center(point.x, point.y)
        state.state.component = group
    }

    disable(state)
    {
        if (state.state.component !== null) {
            state.state.component.remove()
        }
        state.state.component = null
    }

    update(state)
    {
        if (state.state.component !== null) {
            const point = state.model(state.def.name)
            state.state.component.center(point.x, point.y)
        }
    }
}
