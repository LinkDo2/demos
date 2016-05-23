var DataGridLayer = L.Class.extend({

    initialize: function(options) {
        this.renderer = options.renderer;
        this.colorScale = options.colorScale || d3.scale.linear().range(['yellow', 'red']);
        this.data = null;
    },

    onAdd: function(map) {
        this._map = map;

        this._el = L.DomUtil.create('canvas', 'data-grid-layer leaflet-zoom-hide');
        map.getPanes().overlayPane.appendChild(this._el);

        map.on('viewreset', this._reset, this);
        map.on('moveend', this._reset, this);
        map.on('resize', this._reset, this);
    },

    onRemove: function(map) {
        map.getPanes().overlayPane.removeChild(this._el);
        map.off('moveend', this._reset, this);
        map.off('dragend', this._reset, this);
        map.off('resize', this._reset, this);
    },

    _reset: function(e) {
        var pos = map._getMapPanePos();
        this._el.style.transform = 'translate(' + (-pos.x) + 'px,' + (-pos.y) + 'px)';
        this.render();
    },

    render: function() {
        var mapBounds = map.getBounds();
        var mapSize = map.getSize();
        if (!this.data) {
            return this;
        }
        var lat = this.data.lat;
        var lon = this.data.lon;
        var values = this.data.values;

        var canvas = this._el;
        canvas.width = mapSize.x;
        canvas.height = mapSize.y;

        var ctx = canvas.getContext('2d');
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, mapSize.x, mapSize.y);

        var northIndex = bisectionReversed(lat, mapBounds.getNorth());
        var southIndex = bisectionReversed(lat, mapBounds.getSouth());
        var westIndex = bisection(lon, mapBounds.getWest());
        var eastIndex = bisection(lon, mapBounds.getEast());

        // var colorScale = equalizeBrewerSpectral(flattenAndUniquify(values).flattened);
        // var magnitudeExtent = flattenAndUniquify(values, function(d){ return d.magnitude; }).flattened;

        // this.colorScale.domain(colorScaleDomain || [0, 1]);

        ctx.globalAlpha = 1;

        var northWestPoint = map.latLngToContainerPoint(L.latLng(lat[northIndex], lon[Math.max(westIndex, 0)]));
        var northWestPointNextLon = map.latLngToContainerPoint(L.latLng(lat[northIndex], lon[Math.min(westIndex + 1, lon.length - 1)]));
        var nextNorthWestPointNextLat = map.latLngToContainerPoint(L.latLng(lat[northIndex + 1], lon[Math.max(westIndex, 0)]));

        var w = Math.max(northWestPointNextLon.x - northWestPoint.x, 1) + 2;
        // var maxH = pointC.y - pointD.y;

        var point, value, latIndex, nextLatIndex, lonIndex, nextLongIndex;
        for (var i = northIndex - 1; i < southIndex; i++) {
            latIndex = Math.max(i, 0);
            nextLatIndex = Math.min(latIndex + 1, lat.length - 1);

            var firstPointAtCurrentLat = map.latLngToContainerPoint(L.latLng(lat[latIndex], lon[westIndex]));
            var firstPointAtNextLat = map.latLngToContainerPoint(L.latLng(lat[nextLatIndex], lon[westIndex]));

            var h = Math.max(firstPointAtNextLat.y - firstPointAtCurrentLat.y, 1) + 1;

            for (var j = westIndex - 1; j < eastIndex; j++) {
                lonIndex = Math.max(j, 0);
                point = map.latLngToContainerPoint(L.latLng(lat[latIndex], lon[lonIndex]));
                value = values[latIndex][lonIndex];

                if (!isNaN(value) && i % 1 === 0 && j % 1 === 0) {

                    var info = {
                        centerX: point.x,
                        centerY: point.y,
                        width: w,
                        height: h,
                        value: value,
                        data: this.data,
                        columnIndex: i,
                        rowIndex: j,
                        lonIndex: lonIndex,
                        latIndex: latIndex,
                        longitude: lon[lonIndex],
                        latitude: lat[latIndex],
                        colorScale: this.colorScale
                    };

                    this.renderer(ctx, info);
                }
            }
        }

        return this;
    },

    setColorScale: function(colorScale) {
        this.colorScale = colorScale;
        return this;
    },

    setData: function(d) {
        this.data = d;
        return this;
    },

    setRenderer: function(renderer) {
        this.renderer = renderer;
        return this;
    }

});

var DataMarkerLayer = DataGridLayer.extend({

    render: function() {
        var mapBounds = map.getBounds();
        var mapSize = map.getSize();
        if (!this.data) {
            return this;
        }
        var lat = this.data.lat;
        var lon = this.data.lon;
        var values = this.data.values;

        var canvas = this._el;
        canvas.width = mapSize.x;
        canvas.height = mapSize.y;

        var ctx = this._el.getContext('2d');
        ctx.globalAlpha = 1;

        var data = this.data;
        if (!data) {
            return this;
        }

        /*
            TODO:
            -filter for coords in view
        */

        var point, dataPoint, info;
        for (var i = 0; i < data.length; i++) {
            dataPoint = data[i];
            point = map.latLngToContainerPoint(L.latLng(dataPoint.lat, dataPoint.lon));

            info = {
                data: data[i],
                centerX: point.x,
                centerY: point.y
            };

            this.renderer(ctx, info);
        }
        return this;
    }

});


var ToggleControl = L.Control.extend({

    options: {
        position: 'topright'
    },

    initialize: function(options) {
        this.clickCallback = function(d) {
            return;
        };
        this.container;
        this.activeID = 'production-capacity';
    },

    onAdd: function(map) {
        var that = this;
        this.container = L.DomUtil.create('div', 'layer-switcher leaflet-bar leaflet-control leaflet-control-custom');

        this.container.innerHTML = '<div id="production-capacity" class="layer-toggle active">Production Capacity</div><div id="current-wind-speed" class="layer-toggle">Current Wind Speed</div>';

        this.container.onclick = function(e) {
            that.clickCallback(e.target.id);
        }

        return this.container;
    },

    setActive: function(buttonName) {
        var buttonNameSelected = buttonName.replace(/[ ]/g, '-');

        if (this.activeID === buttonNameSelected) {
            return;
        }

        var buttons = this.container.querySelectorAll('.layer-toggle');

        for (var i = 0; i < buttons.length; ++i) {
            buttons[i].classList.remove('active');
        }

        this.container.querySelector('#' + buttonNameSelected).classList.add('active');

        this.activeID = buttonNameSelected;
        return this;
    },

    onClick: function(cb) {
        this.clickCallback = cb;
        return this;
    }
});
