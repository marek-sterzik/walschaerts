export default class Compose
{
    static add(model, name = undefined, namespaced = false)
    {
        return new Compose(model, name, namespaced)
    }

    constructor(model, name = undefined, namespaced = false)
    {
        this.models = []
        this.add(model, name, namespaced)
    }

    add(model, name = undefined, namespaced = false)
    {
        if (name === null && name === undefined) {
            name = null
        }
        this.models.push([name, model, namespaced])
        return this
    }

    create()
    {
        const models = this.models
        return (model, priv) => {
            var index = 1
            for (var mod of models) {
                var name = mod[0]
                if (name === null || name === undefined) {
                    name = "" + (index++)
                }
                model.proxy(name, mod[2]).apply(mod[1])
            }
        }
    }
}
