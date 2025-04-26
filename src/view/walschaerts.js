import updatedComponents from "./def.js"

import ComponentState from "./component_state.js"

export default class
{
    constructor(model, svg)
    {
        this.viewMode = {points: false, pressure: true}
        this.createComponents(model.data.universalGetter(), svg, updatedComponents)
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

    togglePoints()
    {
        this.updateViewMode({points: !this.viewMode.points})
    }

    enablePoints()
    {
        this.updateViewMode({points: true})
    }

    disablePoints()
    {
        this.updateViewMode({points: false})
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
