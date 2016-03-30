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
            });

        this.render();

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
    }
});

//TODO
var ChartView = Backbone.View.extend({

    initialize: function(options) {
        var that = this;
        var config = {
            container: this.el,
            type: 'line',
            subtype: 'area',
            scaleType: 'time',
            tickYCount: 3,
            labelFormatterX: function(d){ return d3.time.format('%X')(new Date(d)); },
            labelFormatterY: d3.format('.2s'),
            margin: {top: 20, right: 100, bottom: 50, left: 50},
        };
        this.chart = cirrus.init(config);
    },

    render: function(model) {
        var chartData = [];
        var data = model.toJSON();
        chartData.push({name: data.key, values: data.values.map(function(d, i){ return {x: d.timestamp, y: d.value}; })});

        this.chart.render(chartData);
    }
});
