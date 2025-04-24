
export default class
{
    constructor(svg, model, def, componentClass)
    {
        this.svg = svg
        this.model = model
        def = {...def}
        delete def.cls
        this.def = componentClass.normalizeDef(def)
        this.state = {}
        this.pointModeEnabled = false
        this.componentClass = componentClass
    }

    initialize()
    {
        this.componentClass.initialize(this)
    }

    enablePointMode(pointModeEnabled)
    {
        if (this.pointModeEnabled !== pointModeEnabled) {
            if (pointModeEnabled) {
                this.componentClass.enablePointMode(this)
            } else {
                this.componentClass.disablePointMode(this)
            }
            this.pointModeEnabled = pointModeEnabled
        }
    }

    update()
    {
        this.componentClass.update(this)
    }

    needsUpdate()
    {
        return this.componentClass.needsUpdate(this)
    }
}
