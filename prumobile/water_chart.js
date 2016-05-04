d3.text('water.csv', function(error, text) {
    var container = d3.select('.prumo-water .charts-container');
    var infobox = d3.select('.nav');

    var csv = d3.csv.parseRows(text);
    // console.log(csv);

    for (var i=2; i < csv.length; i++) {
    // for (var i=3; i < 4; i++) {

        var threshold = null;
        var parsedThreshold = null;
        var csvParsed = csv[i].map(function(d, iB){

            if(iB < 2) return d;

            var hasThreshold = false;
            var parsed = null;
            if(d.match(/</)){
                parsed = d.replace(/[< ]/gi, '').replace(/,/, '.');
                hasThreshold = true;
            }
            else{
                parsed = d.replace(/,/gi, '');
            }

            if(parseFloat(parsed)){
                parsed = +parsed;
                if(hasThreshold){
                    parsedThreshold = parsed
                    threshold = d;
                }
            }
            else if(parsed === ''){
                parsed = null;
            }
            return parsed;
        });

        var data = csvParsed.filter(function(d){ return parseFloat(d); });
        var dataRawNonNull = csv[i].filter(function(d){ return d && d !== ""; });

        var timestamps = csv[0].slice(2, -1).map(function(d, i){ return d.replace(/\n.*/ig, ''); });

        var zipped = d3.zip(timestamps, csv[i].slice(2, -1), csvParsed.slice(2, -1));

        var dataCleaned = []

        timestamps.forEach(function(dB, iB){
            if(csvParsed.slice(2, -1)[iB]){
                dataCleaned.push({timestamp: dB, rawValue: csv[i].slice(2, -1)[iB], value: csvParsed.slice(2, -1)[iB]});
            }
        });

        var nestedData = d3.nest()
            .key(function(d) { return d.timestamp; })
            .entries(dataCleaned);

        var chartContainer = container.append('div').classed('chart-container ui card', true);

        var chart = piper.barChartGroupedPrumo({
                container: chartContainer.node(),
                width: 300,
                height: 100,
                margin: {top: 30, right: 70, bottom: 20, left: 60},
                data: nestedData,
                axisTitleY: csvParsed[1],
                chartTitle: csvParsed[0],
                thresholdY: parsedThreshold,
                thresholdYLabel: threshold
            });

        var tooltip = piper.tooltipWidget(d3.select('.tooltip').node());

        chart.mouseenter.on(function(d){
            tooltip.show();
        });
        chart.mouseout.on(function(d){
            tooltip.hide();
        });
        chart.mousemove.on(function(d){
            tooltip.setText(d.data.groupName + '<br>' + d.data.y)
                .setPosition([d.shapePositionFromContainer[0], d.mouseFromContainer[1]]);
        });

        var tooltipCallback = function(_info){
            var info = _info;
            return function(d){

                console.log(new Date(info.metadata1[d.x].replace(/\n.*/ig, '')));
                
                infobox.html('<h1>' + info.title + '</h1>' + 
                    '<div class="info1">' + info.metadata1[d.x] + '</div><br />' + 
                    '<div class="info2">' + info.metadata2[d.x] + '</div><br />' + 
                    '<div class="info3">' + info.data[0] + ' <span class="unit">(' + info.data[1] + ')</span>: </div><div class="info4">' + info.data[d.x + 2] + '</div>')
            };
        }

        var tooltipData = {title: 'TS - Águas Superficiais Marinhas', data: dataRawNonNull, metadata1: csv[0].slice(2), metadata2: csv[1].slice(2)}
    }

});
