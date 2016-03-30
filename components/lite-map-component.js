var liteMap = function(){

    var config = {
        el: null,
        width: 'auto',
        height: 'ratio',
        polygon: null,
        raster: null,
        rotation: [0, 0],
        colorScale: function(values){ return d3.scale.linear().domain(d3.extent(values)).range(['black', 'white']); },
        unit: '',
        nullValue: null,
        antemeridianCuttingCheck: false,
        windingCheck: true,
        projection: 'equirectangular'
        //projection: 'mercator'
        //projection: 'transverseMercator'
        //projection: 'orthographic'
    };

    var events = d3.dispatch('click');

    var height = 0;
    var width = 0;
    var countries = null;

    var projection = d3.geo[config.projection](),
        path = d3.geo.path(),
        graticule = d3.geo.graticule(),
        svg,
        canvas,
        container,
        panel,
        countriesGroup,
        countryPaths,
        graticulePath,
        equatorPath,
        polygon,
        tooltip,
        panelNode,
        polygonDataCached = null,
        rasterDataWithCoordsCached = null;

    var zoom = d3.behavior.zoom()
        .scaleExtent([1, 9])
        .on('zoom', function(){
            var t = d3.event.translate,
                s = d3.event.scale;

            t[0] = Math.min(0, Math.max(-width * (s - 1), t[0]));
            t[1] = Math.min(0, Math.max(-height * (s - 1) - (height - height) * s / 2, t[1]));

            zoom.translate(t);
            panel.attr('transform', 'translate(' + t + ')scale(' + s + ')');

            countryPaths.style('stroke-width', 1 / s);
            graticulePath.style('stroke-width', 0.5 / s);
            equatorPath.style('stroke-width', 0.5 / s);
        });

    var enableZoom = function(d){
        if(svg){
            svg.call(zoom);
        }
        return this;
    };

    var disableMouseWheelZoom = function(d){
        if(svg){
            svg.on("mousewheel.zoom", null)
                .on("wheel.zoom", null)
                .on("MozMousePixelScroll.zoom", null);
        }
        return this;
    };

    var setConfig = function(_config){
        config = utils.mergeAll(config, _config);

        if(_config.model){ bindModelEvents.call(this, _config.model); }

        return this;
    };

    var renderPolygon = function(_polygonData){
        polygonDataCached = _polygonData;

        var polygonData = (config.windingCheck) ? geojsonRewind(_polygonData[0]) : _polygonData[0];

        if(!polygonData || !(polygonData && polygonData.geometry && polygonData.geometry.type)){
            console.warn('Polygon data is invalid', _polygonData);
            return this;
        }

        console.log(JSON.stringify(polygonData));

        polygon.datum(polygonData)
            .filter(function(d){
                if(config.antemeridianCuttingCheck){
                    var bounds = path.bounds(d);
                    var needsAntemeridianCutting = !bounds.filter(function(d){
                        return Math.abs(d[0]) > 360 || Math.abs(d[1]) > 180;
                    }).length;
                    if(needsAntemeridianCutting){
                        projection.clipAngle(181);
                    }
                }

                var size =  Math.sqrt(path.area(d));
                return size > 10;
            })
            .attr({
                d: path,
                fill: polygonData.properties && polygonData.properties.autoColor ? polygonData.properties.autoColor : 'skyblue'
            });

        polygon.datum(polygonData)
            .filter(function(d){
                var bounds = path.bounds(d);
                var size =  Math.sqrt(path.area(d));
                return size < 10;
            })
            .attr({
                d: function(d){
                    var centroid = path.centroid(d);
                    var size = 20;
                    return 'm '+centroid[0]+','+centroid[1]+' c 0,0 0,-0.5 -3.5,-4 -1,-1 -2.5,-2.6 -2.5,-4 0,-4 6,-4 6,-4 0,0 6,0 6,4 0,1.4 -1.5,3 -2.5,4 -3.5,3.5 -3.5,4 -3.5,4 z';
                },
                fill: polygonData.properties && polygonData.properties.autoColor ? polygonData.properties.autoColor : 'skyblue'
            });

        polygon.style({'fill-rule': 'evenodd'});

        return this;
    };

    var renderRaster = function(rasterDataWithCoords){
        rasterDataWithCoordsCached = rasterDataWithCoords;

        if(!rasterDataWithCoords.lon || !rasterDataWithCoords.lon){
            console.log('No suitable raster data');
            return;
        }

        if(width === 0 || height === 0){
            console.log('Rendering problem');
            return;
        }
        var rasterData = rasterDataWithCoords.values;
        var rasterLon = rasterDataWithCoords.lon;
        var rasterLat = rasterDataWithCoords.lat;

        var rasterData1D = d3.merge(rasterData);

        var lonLength = rasterData[0].length;
        var latLength = rasterData.length;

        d3.bisectorComp = function(compare) {
            return {
                left: function(a, x, lo, hi) {
                    if (arguments.length < 3) lo = 0;
                    if (arguments.length < 4) hi = a.length;
                    while (lo < hi) {
                        var mid = lo + hi >>> 1;
                        if (compare(a[mid], x) < 0) lo = mid + 1;
                        else hi = mid;
                    }
                    return lo;
                },
                right: function(a, x, lo, hi) {
                    if (arguments.length < 3) lo = 0;
                    if (arguments.length < 4) hi = a.length;
                    while (lo < hi) {
                        var mid = lo + hi >>> 1;
                        if (compare(x, a[mid]) < 0) hi = mid;
                        else lo = mid + 1;
                    }
                    return lo;
                }
            };
        };

        var canvasNode = canvas.node();
        canvas.attr({
            width: width,
            height: height
        })
        //.style({'z-index': 1})
        .on('mousemove', function(){
            var mouse = d3.mouse(this);
            var projectedCoordinates = projection.invert(mouse);
            var coordX = (projectedCoordinates[0] + 360) % 360;
            var coordY = projectedCoordinates[1];

            var latIsSorted = rasterLat[0] < rasterLat[rasterLat.length -1];

            var bisect = d3.bisectorComp(d3.descending);
            var indexLon = d3.bisect(rasterLon, coordX);
            var indexLat = latIsSorted ? d3.bisect(rasterLat, coordY) : bisect.right(rasterLat, coordY);

            if(!(indexLat && rasterLat[indexLat])) return this;

            var rasterValue = rasterData[indexLat][indexLon];
            var tooltipText = (rasterValue === config.nullValue || typeof rasterValue === 'undefined' || isNaN(rasterValue)) ? '' : rasterValue + ' ' + config.unit;

            tooltip.text(tooltipText)
                .style({
                    display: 'block'
                })
                .attr({
                    x: mouse[0],
                    y: mouse[1]
                });
        })
        .on('mouseout', function(){
            tooltip.style({
                    display: 'none'
                });
        });

        var ctx = canvasNode.getContext('2d');
        ctx.clearRect(0, 0, width, height);

        var dataExtent = d3.extent(rasterData1D);

        var colorScale = config.colorScale(rasterData1D, config.nullValue);

        var location, rasterPoint, sx, sy;
        var rectWidth = Math.ceil(width / rasterLon.length);
        var rectHeight = Math.ceil(height / rasterLat.length);
        // if single data point, make it an arbitrary size
        if(rasterLon.length === 1 && rasterLat.length === 1){
            rectWidth = rectHeight = 10;
        }

        var renderRect = function(datum){
            var dataLat = rasterLat[datum[0]];
            var dataLon = rasterLon[datum[1]];
            var rasterValue = rasterData[datum[0]][datum[1]];
            var rasterPointProjected = projection([dataLon, dataLat]);

            if(!isNaN(rasterValue) && rasterValue !== config.nullValue){
                var color = d3.rgb(colorScale(rasterValue)).toString();
                ctx.beginPath();
                ctx.fillStyle = color;
                if(config.projection === 'mercator'){
                    var mercatorRectHeight = rectHeight + Math.pow(Math.abs(dataLat) / 90 + 1, 3) + 1;
                    ctx.rect(rasterPointProjected[0] - rectWidth / 2, rasterPointProjected[1] - mercatorRectHeight, rectWidth, mercatorRectHeight);
                }
                else{
                    // need some overlap for antialiasing (AA)
                    var rectHeightAA = rectHeight+1;
                    var rectWidthAA = (rectWidth > 1) ? rectWidth+1 : rectWidth;
                    ctx.rect(Math.ceil(rasterPointProjected[0] - rectWidthAA / 2), Math.ceil(rasterPointProjected[1] - rectHeight / 2), rectWidthAA, rectHeightAA);
                }
                ctx.fill();
            }
        };

        //console.time('render');
        var useProgressiveRendering = true;
        if(useProgressiveRendering){
            var data = [];
            var stepLat = Math.floor((latLength * rectHeight) / height);
            var stepLon = Math.floor((lonLength * rectWidth) / width);
            for (var latIdx = 0; latIdx < latLength; latIdx += stepLat){
                for (var lonIdx = 0; lonIdx < lonLength; lonIdx += stepLon){
                    data.push([latIdx, lonIdx]);
                }
            }
            renderSlicer(renderRect).rate(10000)(data);
        }
        else{
            for (var latIdx = 0; latIdx < latLength; latIdx += 1){
                for (var lonIdx = 0; lonIdx < lonLength; lonIdx += 1){
                    renderRect([latIdx, lonIdx]);
                }
            }
        }
        //console.timeEnd('render');

        return this;
    };

    var render = function(){
        if(!config.el){ return }

        panelNode = config.el;

        countries = topojson.feature(worldMap, worldMap.objects.countries).features;
        var style = window.getComputedStyle(panelNode);

        height = config.height;
        if(config.width === 'auto'){
            width = ~~(panelNode.offsetWidth - parseInt(style.paddingLeft) - parseInt(style.paddingRight));
        }
        if(config.height === 'auto'){
            height = ~~(panelNode.offsetHeight- parseInt(style.paddingTop) - parseInt(style.paddingBottom));
        }

        // compute scaling, translation and optimal height
        // http://stackoverflow.com/questions/14492284/center-a-map-in-d3-given-a-geojson-object
        projection.scale(1)
            .translate([0, 0])
            .rotate(config.rotation);

        path.projection(projection);

        var b = path.bounds(topojson.feature(worldMap, worldMap.objects.land));
        var ratio = Math.abs(b[1][1] - b[0][1]) / Math.abs(b[1][0] - b[0][0]);

        if(config.height === 'ratio'){
            height = ~~(width * ratio);
        }

        var s =  1 / Math.max(Math.abs(b[1][0] - b[0][0]) / width, Math.abs(b[1][1] - b[0][1]) / height);
        var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

        projection
            .scale(s)
            .translate(t)
            .rotate(config.rotation)
            .center([0, 0])
            .precision(0);

        projection.clipAngle(null);

        path.projection(projection);

        canvas = d3.select(panelNode)
            .style({height: height + 'px'})
            .selectAll('canvas')
            .data([0]);

        canvas.enter().append('canvas')
            .style({position: 'absolute'})
            .attr({
                width: width,
                height: height
            })
            .on('click', function(){
                console.log(1);
                var mouse = d3.mouse(this);
                var projectedCoordinates = projection.invert(mouse);
                var coordX = ((projectedCoordinates[0] + 360) % 360);
                var coordY = projectedCoordinates[1];
                events.click(projectedCoordinates);
            });

        svg = d3.select(panelNode).selectAll('svg')
            .data([0]);

        var svgEnter = svg.enter().append('svg')
            .attr({'class': 'map'})
            .style({position: 'absolute'});

        var gContainerEnter = svgEnter.append('g')
            .attr({'class': 'container'});
        gContainerEnter.append('rect')
            .attr({
                'class': 'panel-background'
            });

        var gEnter = gContainerEnter.append('g')
            .attr({'class': 'panel'})
            .on('click', function(){
                var latlon = projection.invert(d3.mouse(this));
            });

        svg.attr({
            width: width,
            height: height,
            xmlns: 'http://www.w3.org/2000/svg',
            ':xmlns:xlink': 'http://www.w3.org/1999/xlink'
        })
        .style({'pointer-events': 'none'});

        svg.select('.panel-background')
            .attr({
                width: width,
                height: height
            });

        gEnter.append('path').attr({'class': 'graticule'});
        gEnter.append('path').attr({'class': 'equator'});
        gEnter.append('g').attr({'class': 'countries'});
        gEnter.append('path').attr({'class': 'polygon'});
        gEnter.append('text').attr({'class': 'tooltip'}).style({display: 'none'});

        container = svg.select('g.container');
        panel = svg.select('g.panel');
        countriesGroup = svg.select('g.countries');
        graticulePath = panel.select('.graticule');
        equatorPath = panel.select('.equator');
        polygon = panel.select('.polygon');
        tooltip = panel.select('.tooltip');

        graticulePath.datum(graticule)
            .attr({d: path});

        equatorPath.datum({type: 'LineString', coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]})
            .attr({
                d: path
            });

        if(countries){
            countryPaths = countriesGroup.selectAll('.country').data(countries);

            countryPaths.enter().insert('path')
                .attr({
                    'class': 'country'
                });

            countryPaths.attr({
                d: path,
                id: function(d, i){
                    return d.id;
                },
                title: function(d, i){
                    return d.properties.name;
                }
            });

            countryPaths.exit().remove();
        }

        return this;
    };

    var resize = function(d){
        render();
        if(polygonDataCached){
            renderPolygon(polygonDataCached);
        }
        if(rasterDataWithCoordsCached){
            renderRaster(rasterDataWithCoordsCached);
        }
        return this;
    };

    var exports = {

        config: setConfig,

        renderPolygon: renderPolygon,

        renderRaster: renderRaster,

        render: render,

        resize: resize,

        enableZoom: enableZoom,

        disableMouseWheelZoom: disableMouseWheelZoom
    };

    d3.rebind(exports, events, 'on');

    return exports;
};
