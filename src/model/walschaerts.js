import {Vector, Angle} from "eeg2d"
import {calibration, consts} from "./calibration.js"
import {distanceToAngle} from "./geometry.js"
import {wheelsModel, expansionLinkModel} from "./mechanics.js"

import WheelModel from "./mechanics/wheel.js"
import CalibratedMechanics from "./mechanics/calibrated.js"
import TranslationMechanics from "../old/translation_mechanics.js"


export default class
{
    constructor()
    {
        this.calibration = calibration
        this.consts = consts
        
        //points which will contain points of the valve gear model
        this.points = {}

        //params contain other parameters of the valve gear model
        this.params = {
            "mainWheelAngle": Angle.zero(),
            "smallWheelAngle": Angle.zero(),
            "expansion": 1,
        };

        //the mechanic models itself
        this.mechanicModels = [];

        //statistics and averages
        this.statistics = [];
        this.averages = {};
        this.averageCycles = 10;

        this.points.leftWheelCenter = calibration.leftWheelCenter
        this.points.mainWheelCenter = calibration.mainWheelCenter
        this.points.rightWheelCenter = calibration.rightWheelCenter

        this.points.smallWheel1Center = calibration.smallWheel1Center
        this.points.smallWheel2Center = calibration.smallWheel2Center

        this.addModel("wheels", wheelsModel(this.calibration))
        this.addModel("expansionLink", expansionLinkModel(this.calibration))
        this._setupModel3()
        this._setupModel4()
        this._setupModel5()
        this._setupModel6()

        this.recalc()
    }

    addDistance(distance)
    {
        this.params.mainWheelAngle = this.params.mainWheelAngle.add(distanceToAngle(distance, this.consts.mainWheelRadius)) 
        this.params.smallWheelAngle = this.params.smallWheelAngle.add(distanceToAngle(distance, this.consts.smallWheelRadius))
        this.recalc()
    }

    setExpansion(expansion)
    {
        if (expansion > 1) {
            expansion = 1;
        } else if (expansion < -1) {
            expansion = -1;
        }
        this.params.expansion = expansion;
        this.recalc();
    }

    getExpansion()
    {
        return this.params.expansion;
    }

    _recalcAngle(originalAngle, radius, distance)
    {
        return this._normalizeAngle(originalAngle + (distance / radius));
    }

    _normalizeAngle(angle)
    {
        var c = 2 * Math.PI;
        while (angle < 0) {
            angle += c;
        }

        while (angle >= c) {
            angle -= c;
        }

        return angle;
    }


    addModel (name, model)
    {
        this.mechanicModels.push({
            "name": name,
            "model": model,
        });
    }

    _setupModel3()
    {
        var model = new TranslationMechanics(this.calibration);

        model.setInput('crossheadConnectPoint');
        model.setOutputs(['pistonCenter', 'pistonUnionLinkConnectPoint']);
        
        this.addModel("piston", model);
    }

    _setupModel4()
    {
        var model = new WheelModel(this.calibration);

        model.addPointDrivenWheel("expansionLinkConnectPoint", "expansionLinkFixed",
                                  ["expansionLinkTopEnd", "expansionLinkBottomEnd", "expansionLinkRadiusCenter"]);
        
        this.addModel("expansionLink", model);
    }

    _setupModel5()
    {
        var model = new WheelModel(this.calibration);

        var maxAngle = 1;

        model.addWheelWithLinearAngleCompensation("expansion", Angle.rad(-maxAngle/2), Angle.rad(maxAngle/2), "reverseArmCenter",
                                                  ["reverseArmCenter", "reverseArmA", "reverseArmB"]);
        
        this.addModel("reverseArm", model);
    }

    _setupModel6()
    {
        var reachRodMoveDirection = this.calibration.reachRodEnd.vectorTo(this.calibration.reverseArmA);

        var model = new CalibratedMechanics(this.calibration);

        model.addDistanceConstraints([
            ["reachRodEnd", "reverseArmB"],
        ]);

        model.addLineConstraints([
            ['reachRodEnd', reachRodMoveDirection],
        ]);

        model.addInputs(['reverseArmB']);

        model.addOutputs(['reachRodEnd']);

        this.addModel("reachRod", model);
    }



    recalc()
    {
        var t0 = performance.now();
        
        var statistics = [];

        //push the total solve time slot into the statistics
        //the real value will be computed last
        statistics.push({
            "model": "total",
            "param": "solveTime",
            "value": 0,
        });

        for (var i = 0; i < this.mechanicModels.length; i++) {
            var model = this.mechanicModels[i].model;
            var modelName = this.mechanicModels[i].name;
            model.solve(this.points, this.params);
            for (var s in model.statistics) {
                statistics.push({
                    "model": modelName,
                    "param": s,
                    "value": model.statistics[s],
                });
            }
        }

        this._recalcStatistics(statistics, t0);
    }

    _recalcStatistics(statistics, t0)
    {
        var totalSolveTimeIndex = null;
        for (var i = 0; i < statistics.length; i++) {
            var statRecord = statistics[i];
            if (statRecord.model == 'total' && statRecord.param == 'solveTime') {
                totalSolveTimeIndex = i;
            } else {
                statRecord.value = this._updateAverage(statRecord.model+"."+statRecord.param, statRecord.value);
            }
        }

        if (totalSolveTimeIndex != null) {
            var totalSolveTime = performance.now() - t0;
            var statRecord = statistics[totalSolveTimeIndex];
            statRecord.value = this._updateAverage(statRecord.model+"."+statRecord.param, totalSolveTime);
        }

        this.statistics = statistics;
    }

    _updateAverage (id, value)
    {
        if (! (id in this.averages)) {
            this.averages[id] = value;
        } else {
            this.averages[id] = this.averages[id] + (value - this.averages[id])/this.averageCycles;
        }
        return this.averages[id];
    }
}
