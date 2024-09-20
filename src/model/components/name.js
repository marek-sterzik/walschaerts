export default (name, namedModel) => (model, priv) => {
    namedModel(model, priv)
    model.stat("name", name)
}
