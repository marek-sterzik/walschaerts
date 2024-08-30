import $ from "jquery"
import {SVG} from '@svgdotjs/svg.js'
import ValveGearView from "./old/view.js"
import ValveGearModel from "./old/model.js"
import StatView from "./old/statview.js"

export default class WalschaertsValveGear
{
    constructor(element)
    {
        var svg = SVG().addTo(element).size('100%', '100%')
        this.model = new ValveGearModel(0)
        this.expansion = this.model.getExpansion()
        this.view = new ValveGearView(this.model, svg)
        this.statView = new StatView(this.model, $('#statistics'))
        this.interval = null
        this.speed = 30
        this.expansionChangingSpeed = 0.3
        this.expansionTolerance = 0.0001
        this.interval = setInterval(() => {
            this.stepFunction()
        }, 100)
        this.runFlag = false
    }
    
    toggle()
    {
        this.runFlag = !this.runFlag
    }

    running()
    {
        return this.runFlag;
    }
    
    setExpansion(expansion)
    {
        if (expansion < -1) {
            expansion = -1;
        }else if (expansion > 1) {
            expansion = 1;
        }
        this.expansion = expansion;
        return this;
    }

    getExpansion()
    {
        return this.expansion;
    }

    stepFunction()
    {
        var s1 = this.updateDistance();
        var s2 = this.updateExpansion();
        if (s1 || s2) {
            this.view.update();
            this.statView.update();
        }
    }
    
    updateDistance()
    {
        if (this.runFlag) {
            this.model.addDistance(30);
            return true;
        }
        return false;
    }

    updateExpansion()
    {
        var realExpansion = this.model.getExpansion();

        if (Math.abs(realExpansion - this.expansion) > this.expansionTolerance) {
            if (realExpansion > this.expansion) {
                realExpansion -= this.expansionChangingSpeed;
                if (realExpansion < this.expansion) {
                    realExpansion = this.expansion;
                }
            }else {
                realExpansion += this.expansionChangingSpeed;
                if (realExpansion > this.expansion) {
                    realExpansion = this.expansion;
                }
            }
            this.model.setExpansion(realExpansion);
            return true;
        }
        return false;
        
    }
}
