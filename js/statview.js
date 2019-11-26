function StatView(model, div)
{
    this.model = model;
    this.div = div;
    this.lastUpdateTime = null;
    this.updateAfterMiliseconds = 1000;
    this.update();
}

StatView.prototype.update = function ()
{
    var now = performance.now();
    if (this.lastUpdateTime == null || this.lastUpdateTime + this.updateAfterMiliseconds <= now) {
        var mStat = this.model.mStat;
        var statString = '';
        statString += "<h2>mechanic model statistic averages</h2>";
        statString += "<ul>";
        statString += "<li>iterations=<strong>"+mStat.iterations.toFixed(1)+"</strong></li>";
        statString += "<li>solveTime=<strong>"+mStat.solveTime.toFixed(1)+"ms</strong></li>";
        statString += "<li>meanError=<strong>"+(mStat.meanError * 100).toFixed(2)+"%</strong></li>";
        statString += "</ul>";
        this.div.html(statString);
        this.lastUpdateTime = now;
    }
}

