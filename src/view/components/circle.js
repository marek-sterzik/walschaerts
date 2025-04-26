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
        const center = state.model(state.def.center)
        const radius = state.model(state.def.radius)
        const circle = state.svg.circle(radius * 2).move(center.x - radius, center.y - radius).fill('transparent').stroke(state.def.stroke)

        state.state.component = circle
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
            const center = state.model(state.def.center)
            const radius = state.model(state.def.radius)
            state.state.component.radius(radius)
            state.state.component.move(center.x - radius, center.y - radius)
        }
    }
}
