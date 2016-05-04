var w = 300;
var h = 400;
var margin = {
    top: 20,
    right: 40,
    bottom: 20,
    left: 40
};
var triangleSideLength = w - margin.left - margin.right;
var triangleH = ~~((triangleSideLength / 2) * Math.sqrt(3));

function getPoint(d) {
    var x = sandScale(d[2]);
    var y = clayScale(d[0]);
    var offset = Math.tan(30 * Math.PI / 180) * (triangleH - y);
    return [x - offset, y];
}

var clayScale = d3.scale.linear().domain([0, 100]).range([triangleH, 0]);
var sandScale = d3.scale.linear().domain([0, 100]).range([triangleSideLength, 0]);

// base
var svg = d3.select('.sediment .charts-container')
    .append('svg')
    .attr({
        width: w,
        height: h
    });
var triangle = svg.append('g').attr({
    transform: 'translate(' + [margin.left, margin.top] + ')'
});

// arrow
svg.append('defs').append('marker')
    .attr({
        id: 'markerArrow',
        markerWidth: 13,
        markerHeight: 13,
        refX: 2,
        refY: 6,
        orient: 'auto'
    })
    .append('path')
    .attr({
        d: 'M2,2 L2,11 L10,6 L2,2'
    });

// frame
triangle.append('path')
    .attr({
        'class': 'bg-triangle',
        d: 'M' + [
            [triangleSideLength / 2, 0],
            [0, triangleH],
            [triangleSideLength, triangleH]
        ].join('L') + 'Z'
    })
    .on('mousemove', function(d) {
        console.log(d3.mouse(this));
    });

// sectors
var sectorData = [{
    name: 'Clay',
    limits: [
        [100, 0, 0],
        [60, 40, 0],
        [40, 40, 20],
        [40, 15, 45],
        [55, 0, 45],
    ]
}, {
    name: 'Silty Clay',
    limits: [
        [60, 40, 0],
        [40, 60, 0],
        [40, 40, 20]
    ]
}, {
    name: 'Clay Loam',
    limits: [
        [40, 40, 20],
        [27, 53, 20],
        [27, 28, 45],
        [40, 15, 45]
    ]
}, {
    name: 'Silty Clay Loam',
    limits: [
        [40, 60, 0],
        [27, 73, 0],
        [27, 53, 20],
        [40, 40, 20]
    ]
}, {
    name: 'Sandy Clay',
    limits: [
        [55, 0, 45],
        [35, 20, 45],
        [35, 0, 65]
    ]
}, {
    name: 'Sandy Clay Loam',
    limits: [
        [35, 20, 45],
        [27, 28, 45],
        [20, 28, 52],
        [20, 0, 80],
        [35, 0, 65]
    ]
}, {
    name: 'Loam',
    limits: [
        [27, 28, 45],
        [27, 50, 23],
        [5, 50, 45],
        [5, 43, 52],
        [20, 28, 52]
    ]
}, {
    name: 'Sandy Loam',
    limits: [
        [20, 28, 52],
        [5, 43, 52],
        [5, 50, 45],
        [0, 50, 50],
        [0, 30, 70],
        [15, 0, 85],
        [20, 0, 80]
    ]
}, {
    name: 'Sand',
    limits: [
        [10, 0, 90],
        [0, 10, 90],
        [0, 0, 100]
    ]
}, {
    name: 'Loamy Sand',
    limits: [
        [15, 0, 85],
        [0, 30, 70],
        [0, 10, 90],
        [10, 0, 90]
    ]
}, {
    name: 'Silt Loam',
    limits: [
        [27, 50, 23],
        [27, 73, 0],
        [13, 87, 0],
        [13, 80, 7],
        [0, 80, 20],
        [0, 50, 50],
    ]
}, {
    name: 'Silt',
    limits: [
        [13, 80, 7],
        [13, 87, 0],
        [0, 100, 0],
        [0, 80, 20],
    ]
}];

sectorData.forEach(function(d) {
    d.points = d.limits.map(function(dB, iB) {
        return getPoint(dB);
    });
    d.center = d3.geom.polygon(d.points).centroid();
});

var sector = triangle.selectAll('g.sector')
    .data(sectorData);
var sectorEnter = sector.enter().append('g')
    .attr({
        'class': function(d) {
            var className = d.name.toLowerCase().replace(/ /g, '-')
            return 'sector ' + className;
        }
    });
sectorEnter.append('path');
sectorEnter.append('text');
sector.exit().remove();

sector.select('path').attr({
    d: function(d) {
        return 'M' + [d.points].join('L') + 'Z';
    }
});
sector.select('text').text(function(d) {
        return d.name;
    })
    .attr({
        x: function(d) {
            return d.center[0] - d.name.length * 2;
        },
        y: function(d) {
            return d.center[1];
        }
    });

sector.select('text').attr({
    dx: function(d) {
        return -this.getBBox().width / 2;
    }
})

// axis 1
var axis1 = triangle.append('g')
    .attr({
        'class': 'axis1'
    });
var tick = axis1.selectAll('g.tick')
    .data(d3.range(10, 110, 10));
var tickEnter = tick.enter().append('g')
    .attr({
        'class': 'tick'
    });
tickEnter.append('path');
tickEnter.append('text');
tick.exit().remove();

tick.select('path')
    .attr({
        d: function(d) {
            var p1 = getPoint([d, 0, 100 - d]);
            var p2 = getPoint([0, d, 100 - d]);
            return 'M' + [p1, p2].join('L');
        }
    });

tick.select('text')
    .attr({
        x: function(d) {
            var p1 = getPoint([d, 0, 100 - d]);
            return p1[0] - 26;
        },
        y: function(d) {
            var p1 = getPoint([d, 0, 100 - d]);
            return p1[1] + 6;
        }
    })
    .text(function(d) {
        return d;
    });

var axisTitle = axis1.append('g').classed('axis-title', true)
    .attr({
        transform: 'translate(' + [0, triangleSideLength / 2] + ') rotate(-60)'
    });
axisTitle.append('text').text('Clay');
axisTitle.append('path').attr({
    'marker-end': 'url(#markerArrow)',
    d: 'M-10, 5L60, 5L64 10'
});

// axis 2
var axis2 = triangle.append('g')
    .attr({
        'class': 'axis2'
    });
var tick = axis2.selectAll('g.tick')
    .data(d3.range(10, 110, 10));
var tickEnter = tick.enter().append('g')
    .attr({
        'class': 'tick'
    });
tickEnter.append('path');
tickEnter.append('text');
tick.exit().remove();

tick.select('path')
    .attr({
        d: function(d) {
            var p1 = getPoint([d, 100 - d, 0]);
            var p2 = getPoint([0, 100 - d, d]);
            return 'M' + [p1, p2].join('L');
        }
    });

tick.select('text')
    .attr({
        x: function(d) {
            var p1 = getPoint([100 - d, d, 0]);
            return p1[0] + 6;
        },
        y: function(d) {
            var p1 = getPoint([100 - d, d, 0]);
            return p1[1] + 6;
        }
    })
    .text(function(d) {
        return d;
    });

var axisTitle = axis2.append('g').classed('axis-title', true)
    .attr({
        transform: 'translate(' + [triangleSideLength - 40, triangleSideLength / 2 - 50] + ') rotate(60)'
    });
axisTitle.append('text').text('Silt');
axisTitle.append('path').attr({
    'marker-end': 'url(#markerArrow)',
    d: 'M-10, 5L60, 5L64 10'
});

// axis 3
var axis3 = triangle.append('g')
    .attr({
        'class': 'axis3'
    })
var tick = axis3.selectAll('g.tick')
    .data(d3.range(10, 110, 10));
var tickEnter = tick.enter().append('g')
    .attr({
        'class': 'tick'
    });
tickEnter.append('path');
tickEnter.append('text');
tick.exit().remove();

tick.select('path')
    .attr({
        d: function(d) {
            var p1 = getPoint([100 - d, d, 0]);
            var p2 = getPoint([100 - d, 0, d]);
            return 'M' + [p1, p2].join('L');
        }
    });

tick.select('text')
    .attr({
        x: function(d) {
            var p1 = getPoint([0, 100 - d, d]);
            return p1[0] - 6;
        },
        y: function(d) {
            var p1 = getPoint([0, 100 - d, d]);
            return p1[1] + 16;
        }
    })
    .text(function(d) {
        return d;
    });

var axisTitle = axis3.append('g').classed('axis-title', true)
    .attr({
        transform: 'translate(' + [triangleSideLength / 2, triangleH + 60] + ')'
    });
axisTitle.append('text').text('Sand');
axisTitle.append('path').attr({
    'marker-end': 'url(#markerArrow)',
    d: 'M60, -20L-10, -20L-12, -25'
});

// markers

d3.csv('sediment.csv', function(error, csv) {
    var data = csv.map(function(d, i) {
        return [+d.Argila, +d.Silte, +d.Areia];
    });
    // console.log(csv, data);


    // var data = [
    //     [10, 70, 20], // [Clay, Silt, Sand]
    //     [50, 0, 50],
    //     [0, 0, 100]
    // ];

    var marker = triangle.selectAll('g.marker')
        .data(data);
    marker.enter().append('g')
        .attr({
            transform: function(d) {
                var p = getPoint(d);
                return 'translate(' + p + ')';
            }
        })
        .append('path')
        .attr({
            'class': 'marker',
        });
    marker.exit().remove();
    marker.select('path')
        .attr({
            d: function(d) {
                var markerSideLength = 8;
                var markerH = ~~((markerSideLength / 2) * Math.sqrt(3));
                return 'M' + [
                    [0, -markerH / 2],
                    [markerSideLength / 2, markerH / 2],
                    [-markerSideLength / 2, markerH / 2],
                ].join('L') + 'Z'
            }
        });

});
