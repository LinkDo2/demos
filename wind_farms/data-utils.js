function bisection(array, x, isReversed) {
    var mid, low = 0,
        high = array.length - 1;
    while (low < high) {
        mid = (low + high) >> 1;

        if ((isReversed && x >= array[mid]) || (!isReversed && x < array[mid])) {
            high = mid;
        } else {
            low = mid + 1;
        }
    }

    return low;
}

function bisectionReversed(array, x) {
    return bisection(array, x, true);
}

function flattenAndUniquify(data, _accessor) {
    var flattened = [];
    var uniques = [];
    var values, value, i, j, min = Number.MAX_VALUE, max = Number.MIN_VALUE;
    var u = {};
    for (i = 0; i < data.length; i++) {
        values = data[i];
        for (j = 0; j < values.length; j++) {
            value = _accessor ? _accessor(values[j]) : values[j];
            flattened.push(value);
            if (u.hasOwnProperty(value) || value === null) {
                continue;
            }
            u[value] = 1;
            if(value > max){
                max = value;
            }
            if(value < min){
                min = value;
            }
        }
    }
    uniques = Object.keys(u).map(function(d, i){ return +d; });;
    return { flattened: flattened, uniques: uniques, max: max, min: min };
}

function getQuantiles(values, buckets) {
    return d3.scale.quantile().domain(values).range(d3.range(buckets)).quantiles();
};

function equalizeBrewerSpectral(values) {
    var brewerSpectral = ["#5e4fa2", "#3288bd", "#66c2a5", "#abdda4", "#e6f598", "#ffffbf", "#fee08b", "#fdae61", "#f46d43", "#d53e4f", "#9e0142"];
    var quantiles = getQuantiles(values, brewerSpectral.length);
    quantiles.push(Math.max.call(null, values));
    quantiles.unshift(Math.min.call(null, values));
    return d3.scale.linear().domain(quantiles).range(brewerSpectral);
}
