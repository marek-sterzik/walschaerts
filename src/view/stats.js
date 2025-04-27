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
            Object.keys(this.model.averages).sort().forEach((key) => {
                statString += "<li>"
                statString += key+"="
                statString += "<strong>"+this.round(this.model.averages[key], 1)+"</strong>"
                statString += "</li>"
            })
            statString += "</ul>"
            this.div.html(statString)
            this.lastUpdateTime = now
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
