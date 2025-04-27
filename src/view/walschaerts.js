import updatedComponents from "./def.js"

import ComponentState from "./component_state.js"

export default class
{
    constructor(model, svg)
    {
        this.viewMode = {points: false, pressure: true, all: true}
        this.createComponents(model.data.proxy("m1", true).universalGetter(), svg, updatedComponents)
        this.initialize()
        this.update()
    }

    createComponents(model, svg, componentsDef)
    {
        this.components = []
        for (var c in componentsDef) {
            this.components.push(new ComponentState(svg, model, componentsDef[c], componentsDef[c].cls, this.viewMode))
        }
    }

    updateViewMode(viewMode)
    {
        for (var key in viewMode) {
            this.viewMode[key] = viewMode[key]
        }
        for (var c of this.components) {
            c.updateEnable()
        }
        this.updatedComponents = this.components.filter(c => c.isEnabled())
        console.log("numberOfUpdatedComponents", this.updatedComponents.length)
    }

    setViewMode(key, enable)
    {
        if (key === "move") {
            key = "all"
        }
        if (enable === "toggle") {
            enable = !this.viewMode[key]
        }
        if (enable !== true && enable !== false) {
            throw `invalid view mode for key ${key}, needs to be boolean or "toggle"`
        }
        if (key in this.viewMode) {
            this.updateViewMode({[key]: enable})
        }
    }

    setPoints(enable)
    {
        this.setViewMode("points", enable)
    }

    setPressure(enable)
    {
        this.setViewMode("pressure", enable)
    }

    initialize()
    {
        for (var c of this.components) {
            c.initialize()
        }
        this.updateViewMode({})
    }

    update()
    {
        for (var c of this.updatedComponents) {
            c.update()
        }
    }
}
