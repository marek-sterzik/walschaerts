
const updatedPoints = {
    'leftWheelCenter': {color: 'red', width: 2},
    'mainWheelCenter': {color: 'red', width: 2},
    'rightWheelCenter': {color: 'red', width: 2},
    'smallWheel1Center': {color: 'red', width: 2},
    'smallWheel2Center': {color: 'red', width: 2},
    'leftWheelConnectPoint': {color: 'blue', width: 2},
    'mainWheelConnectPoint': {color: 'blue', width: 2},
    'rightWheelConnectPoint': {color: 'blue', width: 2},
    'returnCrankConnectPoint': {color: 'blue', width: 2},
    'expansionLinkFixed': {color: 'cyan', width: 2},
    'expansionLinkConnectPoint': {color: 'blue', width: 2},
    'crossheadConnectPoint': {color: 'magenta', width: 2},
    'pistonCenter': {color: 'magenta', width: 2},
    'pistonUnionLinkConnectPoint': {color: 'magenta', width: 2},
    'expansionLinkTopEnd': {color: 'cyan', width: 2},
    'expansionLinkBottomEnd': {color: 'cyan', width: 2},
    'expansionLinkRadiusCenter': {color: 'cyan', width: 2},
    'reverseArmCenter': {color: 'orange', width: 2},
    'reverseArmA': {color: 'orange', width: 2},
    'reverseArmB': {color: 'orange', width: 2},
    'reachRodEnd': {color: 'orange', width: 2},
    'calibration.radiusBarA': {color: 'green', width: 2},
    'calibration.combinationLeverA': {color: 'green', width: 2},
    'calibration.combinationLeverB': {color: 'green', width: 2},
    'calibration.valveCenter': {color: 'green', width: 2},
    'calibration.valveConnectPoint': {color: 'green', width: 2},
    'calibration.expansionLinkRadiusRod': {color: 'green', width: 2},
}

const updatedLines = {
    "returnCrank": {"p1": "mainWheelConnectPoint", "p2": "returnCrankConnectPoint", "stroke": {color: "blue", width: 3}},
    "couplinkRod": {"p1": "leftWheelConnectPoint", "p2": "rightWheelConnectPoint", "stroke": {color: "blue", width: 5}},
    "eccentricRod": {"p1": "returnCrankConnectPoint", "p2": "expansionLinkConnectPoint", "stroke": {color: "blue", width: 3}},
    "reverseArm1": {"p1": "reverseArmA", "p2": "reverseArmCenter", "stroke": {color: "orange", width: 4}},
    "reverseArm2": {"p1": "reverseArmB", "p2": "reverseArmCenter", "stroke": {color: "orange", width: 4}},
    "reachRod": {"p1": "reachRodEnd", "p2": "reverseArmB", "stroke": {color: "orange", width: 4}},
    "expansionLink1": {"p1": "expansionLinkConnectPoint", "p2": "expansionLinkBottomEnd", "stroke": {color: "blue", width: 3}},
    "pistonRod": {"p1": "mainWheelConnectPoint", "p2": "crossheadConnectPoint", "stroke": {color: "magenta", width: 6}},
    "piston": {"p1": "crossheadConnectPoint", "p2": "pistonCenter", "stroke": {color: "magenta", width: 6}},
    "piston2": {"p1": "crossheadConnectPoint", "p2": "pistonUnionLinkConnectPoint", "stroke": {color: "magenta", width: 3}},
}

const updatedCircles = {
    "leftWheel": {center: "leftWheelCenter", radius: "_.mainWheelRadius", stroke: {color: "red", width: 2}},
    "mainWheel": {center: "mainWheelCenter", radius: "_.mainWheelRadius", stroke: {color: "red", width: 2}},
    "rightWheel": {center: "rightWheelCenter", radius: "_.mainWheelRadius", stroke: {color: "red", width: 2}},
    "smallWheel1": {center: "smallWheel1Center", radius: "_.smallWheelRadius", stroke: {color: "red", width: 2}},
    "smallWheel2": {center: "smallWheel2Center", radius: "_.smallWheelRadius", stroke: {color: "red", width: 2}},
}

const updatedArcs = {
    "expansionLink2": {
        "from": "expansionLinkTopEnd",
        "to": "expansionLinkBottomEnd",
        "clokwise": false,
        "center": "expansionLinkRadiusCenter",
        "stroke": {color: "cyan", width: 4}
    },
}

export {updatedPoints, updatedLines, updatedCircles, updatedArcs}
