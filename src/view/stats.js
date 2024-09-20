export default class
{
    constructor(model, div)
    {
        this.model = model
        this.div = div
        this.lastUpdateTime = null
        this.updateAfterMiliseconds = 1000
        this.update()
    }

    update()
    {
        var now = performance.now()
        if (this.lastUpdateTime == null || this.lastUpdateTime + this.updateAfterMiliseconds <= now) {
            var statString = ''
            statString += "<h2>mechanic model statistic averages</h2>"
            statString += "<ul>"
            for (var i = 0; i < this.model.statistics.length; i++) {
                var statRecord = this.extendRecord(this.model.statistics[i])
                statString += "<li>"
                statString += statRecord.paramFull+"="
                statString += "<strong>"+statRecord.valueFull+"</strong>"
                statString += "</li>"
            }
            statString += "</ul>"
            this.div.html(statString)
            this.lastUpdateTime = now
        }
    }


    extendRecord(statRecord)
    {
        var finalStatRecord = {}
        finalStatRecord.model = statRecord.model
        finalStatRecord.param = statRecord.param
        finalStatRecord.paramFull = statRecord.model+"."+statRecord.param
        finalStatRecord.value = statRecord.value
        finalStatRecord.rounding = this.getRecordRounding(statRecord)
        finalStatRecord.unit = this.getRecordUnit(statRecord)
        finalStatRecord.valueFull = this.round(finalStatRecord.value, finalStatRecord.rounding) + "" + finalStatRecord.unit

        return finalStatRecord
    }

    getRecordRounding(statRecord)
    {
        if (statRecord.param == 'error') {
            return 4
        } else {
            return 1
        }
    }

    getRecordUnit(statRecord)
    {
        if (statRecord.param == 'solveTime' || statRecord.param == 'totalTime') {
            return 'ms'
        } else {
            return ''
        }
    }

    round(value, rounding)
    {
        if (rounding != null) {
            value = value.toFixed(rounding)
        }
        return value
    }
}
