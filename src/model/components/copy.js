export default (copy) => (model, priv) => {
    const getter = model.universalGetter()
    const setter = model.universalSetter()
    for (var key in copy) {
        if (copy[key] instanceof Function) {
            const fun = copy[key]
            setter(key, fun(getter))
        } else {
            setter(key, getter(copy[key]))
        }
    }
}

