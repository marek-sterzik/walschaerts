export default class
{
    constructor(callback)
    {
        this.callback = callback
    }

    solve(pointArray, paramsArray)
    {
        this.callback(pointArray, paramsArray)
    }
}

