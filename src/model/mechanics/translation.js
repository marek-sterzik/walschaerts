export default class
{
    constructor(calibrationData)
    {
        this.calibrationData = calibrationData;
        this.input = null;
        this.points = {};
        this.constraintCounter = 0;
        this.statistics = {};
    }

    setInput(pointId)
    {
        this.input = pointId;
        this.points[pointId] = this.calibrationData[pointId];
    }

    setOutputs(outputs)
    {
        for (var i = 0; i < outputs.length; i++) {
            var p = outputs[i];
            this.points[p] = this.calibrationData[p];
        }
    }

    solve(pointArray, paramsArray)
    {
        var t0 = performance.now();
        
        var translationVector = this.points[this.input].vectorTo(pointArray[this.input]);
        for (var p in this.points) {
            if (p != this.input) {
                pointArray[p] = this.points[p].addVector(translationVector);
            }
        }

        var t1 = performance.now();
        this.statistics['solveTime'] = t1 - t0;
    }
}
