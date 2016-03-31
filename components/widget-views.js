var PointVariableItemView = Backbone.View.extend({

    render: function(data, model) {
        if(data) {
            this.el.innerHTML = '<div class="variable-element">' +
                '<div class="name">' + model.get('longName') + '</div>' +
                '<div class="chart-container"></div>' +
                '</div>';

            var chart = new ChartView({el: this.el.querySelector('.chart-container')}).render(data);
        } else {
            this.el.innerHTML = '<div class="variable-element"><div class="name">' + model.get('longName') + '</div><div class="message">No data available</div></div>';
        };
    }
});

var PointVariableListView = Backbone.View.extend({

    initialize: function(options) {
        this.pointMetadataCollection = options.pointMetadataCollection;
        this.pointDataCollection = options.pointDataCollection;

        this.listenTo(this.pointMetadataCollection, 'reset', this.render);
        this.listenTo(this.pointDataCollection, 'reset', this.render);
    },

    render: function(collection) {
        var that = this;
        this.el.innerHTML = '';
        this.pointMetadataCollection.forEach(function(model) {
            var data = this.pointDataCollection.filter(function(d) {
                return d.get('key') === model.get('key');
            })[0];

            var node = document.createElement('div'); 
            node.className = 'element-container';

            that.el.appendChild(node); 

            var pointVariableItemView = new PointVariableItemView({el: node}).render(data, model);
        });
    }
});

var OpendapVariableListView = Backbone.View.extend({

    initialize: function(options) {
        this.opendapMetadataCollection = options.opendapMetadataCollection;

        this.listenTo(this.opendapMetadataCollection, 'reset', this.render);
    },

    render: function(collection) {
        var elementsHTML = this.opendapMetadataCollection.map(function(model) {
            return '<div class="variable-element"><a href="#' + model.get('key') + '">' + model.get('longName') + '</a></div>';
        }).join('\n');

        this.el.innerHTML = elementsHTML;
    }
});

var MapView = Backbone.View.extend({

    initialize: function(options) {
        var that = this;
        // this.previewDataModel = options.previewDataModel;

        this.map = liteMap()
            .config({
                el: this.el,
                // colorScale: colorBrewer.equalize(colorBrewer.Spectral[11])
            })
            .on('click', function(d) {
                that.trigger('click', d);
                that.renderMarker(d);
            });

        this.render();

        that.renderMarker([0, 0]);

        // this.listenTo(this.previewDataModel, 'change', this.render);
    },

    render: function(model) {
        // var data = model.toJSON();
        this.map
            // .config({
            //     nullValue: NaN
            // })
            .render()
            // .renderRaster(data);
    },

    renderMarker: function(coordinates){
        var polygon = [{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[coordinates, coordinates]]]},"properties":{}}];
        this.map.renderPolygon(polygon);
    }
});

var ChartView = Backbone.View.extend({

    render: function(model) {
        var data = model.toJSON();
        var chartData = data.values;

        var config = {
            container: this.el,
            width: 900,
            height: 120,
            margin: {top: 10, right: 40, bottom: 40, left: 60},
            data: chartData
        }
        this.chart = piper.areaChartTime(config);
    }
});

var InfoView = Backbone.View.extend({

    initialize: function(options) {
        this.pointDataCollection = options.pointDataCollection;

        this.listenTo(this.pointDataCollection, 'reset', this.render);
    },

    render: function(model) {
        var query = model.pointQueryModel;
        var lat = query.get('lat');
        var lon = query.get('lon');
        var firstTimestamp = model.toJSON()[0].values[0].timestamp;

        this.el.innerHTML = '<div>Lat: ' + lat + ', Lon: ' + lon + ', date: ' + d3.time.format('%x')(firstTimestamp) + '</div>';
    }
});
