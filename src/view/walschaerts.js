import updatedComponents from "./def.js"

import ComponentState from "./component_state.js"

export default class
{
    constructor(model, svg)
    {
        this.model = model.data.universalGetter()
        this.svg = svg

        this.createComponents(this.model, svg, updatedComponents)

        this.circles = {}
        this.arcs = {}
        this.objectsCreated = false
        this.pointsVisible = false

        this.initialize()
    }

    createComponents(model, svg, componentsDef)
    {
        this.components = []
        for (var c in componentsDef) {
            this.components.push(new ComponentState(svg, model, componentsDef[c], componentsDef[c].cls))
        }
    }

    togglePoints()
    {
        this.pointsVisible = !this.pointsVisible
        this.updatePointMode()
    }

    enablePoints()
    {
        this.pointsVisible = true
        this.updatePointMode()
    }

    disablePoints()
    {
        this.pointsVisible = false
        this.updatePointMode()
    }

    updatePointMode()
    {
        for (var c of this.components) {
            c.enablePointMode(this.pointsVisible)
        }
        this.updatedComponents = this.components.filter(c => c.needsUpdate())
        console.log("numberOfUpdatedComponents", this.updatedComponents.length)
    }

    initialize()
    {
        for (var c of this.components) {
            c.initialize()
        }
        this.updatePointMode()
    }

    update()
    {
        for (var c of this.updatedComponents) {
            c.update()
        }
    }
}
