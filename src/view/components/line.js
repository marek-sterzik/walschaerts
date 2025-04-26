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

    enable(state)
    {
        const p1 = state.model(state.def.p1)
        const p2 = state.model(state.def.p2)
        const line = state.svg.line(p1.x, p1.y, p2.x, p2.y).stroke(state.def.stroke)
        state.state.component = line
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
            const p1 = state.model(state.def.p1)
            const p2 = state.model(state.def.p2)
            state.state.component.plot(p1.x, p1.y, p2.x, p2.y)
        }
    }
}
