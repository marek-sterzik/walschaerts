import {Point, Vector} from "eeg2d"
import TranslationMechanics from "../old/translation_mechanics.js"
import WheelModel from "../old/wheel_model.js"
import CalibratedMechanics from "../old/calibrated_mechanics.js"
import Geometry from "../old/geometry_object.js"

export default class
{
    constructor()
    {
        var xSize = 700;
        var ySize = 222;
        var trackSize = 3;
        var xOffset = 4;
        var wheelCenterDistance = 149;

        this.mainWheelRadius = 70;
        this.smallWheelRadius = 33;

        //points which will contain points of the valve gear model
        this.points = {};

        //params contain other parameters of the valve gear model
        this.params = {
            "mainWheelAngle": 0,
            "smallWheelAngle": 0,
            "expansion": 1,
        };

        //points which are used for calibration of the mechanic model
        this.calibration = {};

        //the mechanic models itself
        this.mechanicModels = [];

        //statistics and averages
        this.statistics = [];
        this.averages = {};
        this.averageCycles = 10;


        var wheelVOffset = ySize - trackSize - this.mainWheelRadius;

        this.points.leftWheelCenter = new Point(xOffset + this.mainWheelRadius, wheelVOffset);
        this.points.mainWheelCenter = new Point(this.points.leftWheelCenter.x + wheelCenterDistance, wheelVOffset);
        this.points.rightWheelCenter = new Point(this.points.leftWheelCenter.x + 2*wheelCenterDistance, wheelVOffset);

        wheelVOffset = ySize - trackSize - this.smallWheelRadius;
        this.points.smallWheel1Center = new Point(492, wheelVOffset);
        this.points.smallWheel2Center = new Point(665, wheelVOffset);

        this.wheelConnectPointRadius = 30;
        this.returnCrankConnectPointRadius = 23;

        this._setupCalibration();

        this._setupModel1();
        this._setupModel2();
        this._setupModel3();
        this._setupModel4();
        this._setupModel5();
        this._setupModel6();

        this.recalc();
    }

    addDistance(distance)
    {
        this.params.mainWheelAngle = this._recalcAngle(this.params.mainWheelAngle, this.mainWheelRadius, distance);
        this.params.smallWheelAngle = this._recalcAngle(this.params.smallWheelAngle, this.smallWheelRadius, distance);
        this.recalc();
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

    _setupCalibration()
    {
        var xSize = 700;
        var ySize = 222;
        var trackSize = 3;
        var xOffset = 4;
        var wheelCenterDistance = 149;

        this.mainWheelRadius = 70;
        this.smallWheelRadius = 33;
        
        var wheelVOffset = ySize - trackSize - this.mainWheelRadius;

        this.calibration.leftWheelCenter = new Point(xOffset + this.mainWheelRadius, wheelVOffset);
        this.calibration.mainWheelCenter = new Point(this.points.leftWheelCenter.x + wheelCenterDistance, wheelVOffset);
        this.calibration.rightWheelCenter = new Point(this.points.leftWheelCenter.x + 2*wheelCenterDistance, wheelVOffset);

        wheelVOffset = ySize - trackSize - this.smallWheelRadius;
        this.calibration.smallWheel1Center = new Point(492, wheelVOffset);
        this.calibration.smallWheel2Center = new Point(665, wheelVOffset);
        
        var v1 = new Vector(0, 1);
        v1 = v1.mul(this.wheelConnectPointRadius);
        var v2 = new Vector(1, 0);
        v2 = v2.mul(this.returnCrankConnectPointRadius);

        this.calibration.leftWheelConnectPoint = this.calibration.leftWheelCenter.addVector(v1);
        this.calibration.mainWheelConnectPoint = this.calibration.mainWheelCenter.addVector(v1);
        this.calibration.rightWheelConnectPoint = this.calibration.rightWheelCenter.addVector(v1);
        this.calibration.returnCrankConnectPoint = this.calibration.mainWheelCenter.addVector(v2);

        //setup the calibration points itself
        this.calibration.mainWheelConnectPoint = this.calibration.mainWheelConnectPoint;
        this.calibration.returnCrankConnectPoint = this.calibration.returnCrankConnectPoint;
        this.calibration.expansionLinkFixed = new Point(360, 78);
        this.calibration.expansionLinkConnectPoint = new Point(370, 143);
        this.calibration.crossheadConnectPoint = new Point(440, 149);
        this.calibration.pistonCenter = new Point(576, 149);
        this.calibration.pistonUnionLinkConnectPoint = new Point(440, 190);
        this.calibration.expansionLinkTopEnd = new Point(352, 48);
        this.calibration.expansionLinkBottomEnd = new Point(375, 107);

        //recalibrate the expansionLinkBottomEnd so that it has the same distance
        //from the fixed point as the top end
        var expansionLinkRange = this.calibration.expansionLinkFixed.vectorTo(this.calibration.expansionLinkTopEnd).size();
        var bottomRangeVector = this.calibration.expansionLinkFixed.vectorTo(this.calibration.expansionLinkBottomEnd);
        bottomRangeVector = bottomRangeVector.normalize().mul(expansionLinkRange);
        this.calibration.expansionLinkBottomEnd = this.calibration.expansionLinkFixed.addVector(bottomRangeVector);

        this.calibration.expansionLinkRadiusCenter = Geometry.circleCenterFrom3Points(
            this.calibration.expansionLinkTopEnd,
            this.calibration.expansionLinkFixed,
            this.calibration.expansionLinkBottomEnd
        );

        this.calibration.reverseArmCenter = new Point(378, 38);
        this.calibration.reverseArmA = new Point(340, 65);
        this.calibration.reverseArmB = new Point(394, 65);

        this.calibration.reachRodEnd = new Point(230, 58);

        this.calibration.radiusBarA = new Point(349, 104);
        this.calibration.combinationLeverA = new Point(496, 76);
        this.calibration.combinationLeverB = new Point(487, 183);
        this.calibration.valveCenter = new Point(586, 89);

        var valveConnectPointRatio = (this.calibration.valveCenter.y - this.calibration.combinationLeverA.y) /
                                     (this.calibration.combinationLeverB.y - this.calibration.combinationLeverA.y);

        var combinationLeverVector = this.calibration.combinationLeverA.vectorTo(this.calibration.combinationLeverB);
        this.calibration.valveConnectPoint = this.calibration.combinationLeverA.addVector(combinationLeverVector.mul(valveConnectPointRatio));

        var intersections = Geometry.lineCircleIntersections(
            this.calibration.radiusBarA,
            this.calibration.radiusBarA.vectorTo(this.calibration.combinationLeverA),
            this.calibration.expansionLinkRadiusCenter,
            this.calibration.expansionLinkRadiusCenter.vectorTo(this.calibration.expansionLinkFixed).size()
        );

        this.calibration.expansionLinkRadiusRod = intersections[0];
    }

    addModel (name, model)
    {
        this.mechanicModels.push({
            "name": name,
            "model": model,
        });
    }

    _setupModel1()
    {
        var model = new WheelModel(this.calibration);

        model.addWheel("mainWheelAngle", "leftWheelCenter", ["leftWheelCenter", "leftWheelConnectPoint"]);
        model.addWheel("mainWheelAngle", "mainWheelCenter", ["mainWheelCenter", "mainWheelConnectPoint", "returnCrankConnectPoint"]);
        model.addWheel("mainWheelAngle", "rightWheelCenter", ["rightWheelCenter", "rightWheelConnectPoint"]);
        model.addWheel("smallWheelAngle", "smallWheel1Center", ["smallWheel1Center"]);
        model.addWheel("smallWheelAngle", "smallWheel2Center", ["smallWheel2Center"]);

        this.addModel("wheels", model);
    }


    _setupModel2()
    {
        var pistonMoveDirection = new Vector(1, 0);

        var model = new CalibratedMechanics(this.calibration);

        model.addDistanceConstraints([
            ["returnCrankConnectPoint", "expansionLinkConnectPoint"],
            ["expansionLinkConnectPoint", "expansionLinkFixed"],
            ["mainWheelConnectPoint", "crossheadConnectPoint"]
        ]);

        model.addLineConstraints([
            ['crossheadConnectPoint', pistonMoveDirection],
            ['pistonCenter', pistonMoveDirection]
        ]);

        model.addFixedPointConstraints(['expansionLinkFixed']);

        model.addInputs(['returnCrankConnectPoint', 'mainWheelConnectPoint']);

        model.addOutputs([
            'expansionLinkFixed',
            'expansionLinkConnectPoint',
            'crossheadConnectPoint',
            'pistonCenter',
            'pistonUnionLinkConnectPoint',
        ]);

        this.addModel("wheelLinks", model);
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

        model.addWheelWithLinearAngleCompensation("expansion", -maxAngle/2, maxAngle/2, "reverseArmCenter",
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
