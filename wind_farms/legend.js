var legend = function(options) {

    var data;
    var renderer = options.renderer;
    var containerNode = options.container;
    var canvas = document.createElement('canvas');
    canvas.className = 'legend';

    containerNode.appendChild(canvas);

    function setData(_data) {
        data = _data;
        return this;
    }

    function render() {
        canvas.height = 250;
        canvas.width = 200;
        var ctx = canvas.getContext('2d');

        var r, num = 4,
            value;
        var dataMin = data.minMax[0],
            dataMax = data.minMax[1],
            dataSpan = dataMax - dataMin;
        for (var i = 0; i < num; i++) {

            if (i === 0) {
                value = dataMin.toPrecision(1);
            } else if (i === num.length) {
                value = ~~dataMax;
            } else {
                value = ~~(dataMin + i * (dataSpan / num));
            }
            legendInfo = {
                index: i,
                numElements: num,
                label: value + ' ' + data.unit
            };

            renderer(ctx, legendInfo);
        }

        return this;
    }

    function setRenderer(_renderer) {
        renderer = _renderer;
        return this;
    }


    return {
        setData: setData,
        setRenderer: setRenderer,
        render: render
    };
}
