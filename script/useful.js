
function mix(a, b, t) {
    return a + (b - a) * t;
}

function mixArray(arrayA, arrayB, t) {
    var a = [];
    for (var i = 0; i < arrayA.length; ++i) a[i] = mix(arrayA[i], arrayB[i], t);
    return a;
}

function arrayLength(arrayA, arrayB) {
    var x = arrayB[0] - arrayA[0];
    var y = arrayB[1] - arrayA[1];
    var z = arrayB[2] - arrayA[2];
    return Math.sqrt(x * x + y * y + z * z);
}