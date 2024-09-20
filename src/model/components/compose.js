import Name from "./name.js"

export default class Compose
{
    static add(model, name = undefined)
    {
        return new Compose(model, name)
    }

    constructor(model, name = undefined)
    {
        this.models = []
        this.add(model, name)
    }

    add(model, name = undefined)
    {
        if (name !== null && name !== undefined) {
            model = Name(name, model)
        }
        this.models.push(model)
        return this
    }

    create(inlined = false)
    {
        const models = this.models
        if (inlined) {
            return (model, priv) => {
                for (var mod of models) {
                    mod(model, priv)
                }
            }
        } else {
            return (model, priv) => {
                for (var mod of models) {
                    model.apply(mod)
                }
            }
        }
    }
}
