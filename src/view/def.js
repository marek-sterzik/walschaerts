
const updatedPoints = {
    'leftWheelCenter': {color: 'red', width: 1},
    'mainWheelCenter': {color: 'red', width: 1},
    'rightWheelCenter': {color: 'red', width: 1},
    'smallWheel1Center': {color: 'red', width: 1},
    'smallWheel2Center': {color: 'red', width: 1},
    'leftWheelConnectPoint': {color: 'blue', width: 1},
    'mainWheelConnectPoint': {color: 'blue', width: 1},
    'rightWheelConnectPoint': {color: 'blue', width: 1},
    'returnCrankConnectPoint': {color: 'blue', width: 1},
    'expansionLinkFixedPoint': {color: 'cyan', width: 1},
    'expansionLinkConnectPoint': {color: 'blue', width: 1},
    'crossheadConnectPoint': {color: 'magenta', width: 1},
    'pistonCenter': {color: 'magenta', width: 1},
    'crossheadUnionLinkConnectPoint': {color: 'magenta', width: 1},
    'expansionLinkTopEnd': {color: 'cyan', width: 1},
    'expansionLinkBottomEnd': {color: 'cyan', width: 1},
    'expansionLinkRadiusCenter': {color: 'cyan', width: 1},
    'reverseArmFixedPoint': {color: 'orange', width: 1},
    'reverseArmA': {color: 'orange', width: 1},
    'reverseArmB': {color: 'orange', width: 1},
    'reachRodEnd': {color: 'orange', width: 1},
    'calibration.radiusBarA': {color: 'green', width: 1},
    'calibration.combinationLeverA': {color: 'green', width: 1},
    'calibration.combinationLeverB': {color: 'green', width: 1},
    'calibration.valveCenter': {color: 'green', width: 1},
    'calibration.valveConnectPoint': {color: 'green', width: 1},
    'calibration.expansionLinkRadiusRod': {color: 'green', width: 1},
    'calibration.reachRodEndMin': {color: 'green', width: 1},
    'calibration.reachRodEndMax': {color: 'green', width: 1},
}

const updatedLines = {
    "returnCrank": {"p1": "mainWheelConnectPoint", "p2": "returnCrankConnectPoint", "stroke": {color: "blue", width: 2}},
    "couplinkRod": {"p1": "leftWheelConnectPoint", "p2": "rightWheelConnectPoint", "stroke": {color: "blue", width: 3}},
    "eccentricRod": {"p1": "returnCrankConnectPoint", "p2": "expansionLinkConnectPoint", "stroke": {color: "blue", width: 2}},
    "reverseArm1": {"p1": "reverseArmA", "p2": "reverseArmFixedPoint", "stroke": {color: "orange", width: 2}},
    "reverseArm2": {"p1": "reverseArmB", "p2": "reverseArmFixedPoint", "stroke": {color: "orange", width: 2}},
    "reachRod": {"p1": "reachRodEnd", "p2": "reverseArmB", "stroke": {color: "orange", width: 2}},
    "expansionLink1": {"p1": "expansionLinkConnectPoint", "p2": "expansionLinkBottomEnd", "stroke": {color: "blue", width: 2}},
    "pistonRod": {"p1": "mainWheelConnectPoint", "p2": "crossheadConnectPoint", "stroke": {color: "magenta", width: 3}},
    "piston": {"p1": "crossheadConnectPoint", "p2": "pistonCenter", "stroke": {color: "magenta", width: 3}},
    "piston2": {"p1": "crossheadConnectPoint", "p2": "crossheadUnionLinkConnectPoint", "stroke": {color: "magenta", width: 2}},
}

const updatedCircles = {
    "leftWheel": {center: "leftWheelCenter", radius: "consts.mainWheelRadius", stroke: {color: "red", width: 1}},
    "mainWheel": {center: "mainWheelCenter", radius: "consts.mainWheelRadius", stroke: {color: "red", width: 1}},
    "rightWheel": {center: "rightWheelCenter", radius: "consts.mainWheelRadius", stroke: {color: "red", width: 1}},
    "smallWheel1": {center: "smallWheel1Center", radius: "consts.smallWheelRadius", stroke: {color: "red", width: 1}},
    "smallWheel2": {center: "smallWheel2Center", radius: "consts.smallWheelRadius", stroke: {color: "red", width: 1}},
}

const updatedArcs = {
    "expansionLink2": {
        "from": "expansionLinkTopEnd",
        "to": "expansionLinkBottomEnd",
        "clokwise": false,
        "center": "expansionLinkRadiusCenter",
        "stroke": {color: "cyan", width: 2}
    },
}

export {updatedPoints, updatedLines, updatedCircles, updatedArcs}
