function TranslationMechanics(calibrationData)
{
    this.calibrationData = calibrationData;
    this.input = null;
    this.points = {};
    this.constraintCounter = 0;
    this.statistics = {};
}

TranslationMechanics.prototype.setInput = function (pointId)
{
    this.input = pointId;
    this.points[pointId] = this.calibrationData[pointId];
}

TranslationMechanics.prototype.setOutputs = function (outputs)
{
    for (var i = 0; i < outputs.length; i++) {
        var p = outputs[i];
        this.points[p] = this.calibrationData[p];
    }
}

TranslationMechanics.prototype.solve = function (pointArray, paramsArray)
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

export default TranslationMechanics
