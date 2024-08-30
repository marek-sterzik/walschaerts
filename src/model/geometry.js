import {Point} from "eeg2d"

const matrixLinearCombination = (matrix, lineCoefficients) => {
    const rows = matrix.length;
    const columns = matrix[0].length;
    const finalVector = [];
    for (var j = 0; j < columns; j++) {
        finalVector[j] = 0;
    }
    
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < columns; j++) {
            finalVector[j] += lineCoefficients[i] * matrix[i][j];
        }
    }

    return finalVector;
}

const solve2Matrix = (matrix) => {
    if (Math.abs(matrix[0][0]) < Math.abs(matrix[1][0])) {
        matrix[0] = matrixLinearCombination(matrix, [1/matrix[0][0], 0]);
        matrix[1] = matrixLinearCombination(matrix, [-matrix[1][0], 1]);
        matrix[1] = matrixLinearCombination(matrix, [0, 1/matrix[1][1]]);
        matrix[0] = matrixLinearCombination(matrix, [1, -matrix[0][1]]);
    }

    return [matrix[0][2], matrix[1][2]];
}

const circleCenterFrom3Points = (a, b, c) => {
    var va = b.vectorTo(a);
    var vb = b.vectorTo(c);
    var A = b.addVector(va.mul(.5));
    var B = b.addVector(vb.mul(.5));

    var matrix = [
        [va.x, va.y, va.x * A.x + va.y * A.y],
        [vb.x, vb.y, vb.x * B.x + vb.y * B.y]
    ];

    var solution = solve2Matrix(matrix);

    return new Point(solution[0], solution[1]);
}



const lineCircleIntersections = (linePoint, lineVector, circleCenter, circleRadius) => {
    const u = circleCenter.vectorTo(linePoint);

    const a = lineVector.mul(lineVector);
    const b = 2*lineVector.mul(u);
    const c = u.mul(u) - circleRadius * circleRadius;

    const d = b*b - 4*a*c;

    if (d < 0) {
        return [];
    }

    const dSqrt = Math.sqrt(d);

    const t1 = (-b - dSqrt)/(2*a);
    const t2 = (-b + dSqrt)/(2*a);

    const p1 = linePoint.addVector(lineVector.mul(t1));
    const p2 = linePoint.addVector(lineVector.mul(t2));

    return [p1, p2];
}

export {circleCenterFrom3Points, lineCircleIntersections}
