function GeometryObject()
{
}

GeometryObject.prototype.circleCenterFrom3Points = function(a, b, c)
{
    var va = b.vectorTo(a);
    var vb = b.vectorTo(c);
    var A = b.addVector(va.mul(.5));
    var B = b.addVector(vb.mul(.5));

    var matrix = [
        [va.x, va.y, va.x * A.x + va.y * A.y],
        [vb.x, vb.y, vb.x * B.x + vb.y * B.y]
    ];

    var solution = this.solve2Matrix(matrix);

    return new Point(solution[0], solution[1]);
}


GeometryObject.prototype.solve2Matrix = function(matrix)
{
    if (Math.abs(matrix[0][0]) < Math.abs(matrix[1][0])) {
        var x = matrix[0];
        matrix[0] = this.matrixLinearCombination(matrix, [1/matrix[0][0], 0]);
        matrix[1] = this.matrixLinearCombination(matrix, [-matrix[1][0], 1]);
        matrix[1] = this.matrixLinearCombination(matrix, [0, 1/matrix[1][1]]);
        matrix[0] = this.matrixLinearCombination(matrix, [1, -matrix[0][1]]);
    }

    return [matrix[0][2], matrix[1][2]];
}

GeometryObject.prototype.matrixLinearCombination = function (matrix, lineCoefficients)
{
    var rows = matrix.length;
    var columns = matrix[0].length;
    var finalVector = [];
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

Geometry = new GeometryObject();
