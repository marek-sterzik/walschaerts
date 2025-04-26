
export default class
{
    constructor(svg, model, def, componentClass, viewMode)
    {
        this.svg = svg
        this.model = model
        this.when = def.when
        if (this.when === undefined || this.when === null) {
            this.when = "all"
        }
        def = {...def}
        delete def.cls
        delete def.when
        this.def = componentClass.normalizeDef(def)
        this.state = {}
        this.enabled = null
        this.componentClass = componentClass
        this.viewMode = viewMode
    }

    initialize()
    {
        this.componentClass.initialize(this)
    }

    updateEnable()
    {
        const enabled = this.isEnabled()
        if (this.enabled !== enabled) {
            if (enabled) {
                this.componentClass.enable(this)
            } else {
                this.componentClass.disable(this)
            }
            this.enabled = enabled
            this.update()
        }
    }

    update()
    {
        if (this.enabled) {
            this.componentClass.update(this)
        }
    }

    isEnabled()
    {
        var enabled = this.viewMode[this.when]
        if (enabled === undefined || enabled === null) {
            enabled = true
        }
        return enabled ? true : false
    }
}
