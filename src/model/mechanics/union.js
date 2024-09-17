export default class
{
    constructor(models)
    {
        this.models = models
    }

    solve(pointArray, paramsArray)
    {
        for (var model of this.models) {
            model.solve(pointArray, paramsArray)
        }
    }
}

