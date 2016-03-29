var PointVariableListView = Backbone.View.extend({

    initialize: function(options) {
        this.pointMetadataCollection = options.pointMetadataCollection;
        this.pointDataCollection = options.pointDataCollection;

        this.listenTo(this.pointMetadataCollection, 'reset', this.render);
        this.listenTo(this.pointDataCollection, 'reset', this.render);
    },

    render: function(collection) {
        var elementsHTML = this.pointMetadataCollection.map(function(model) {
            var data = this.pointDataCollection.filter(function(d) {
                return d.get('key') === model.get('key');
            })[0];

            if(data) {
                return '<div class="variable-element">' +
                    '<div class="name">' + model.get('longName') + '</div>' +
                    '<div class="data">' + JSON.stringify(data.get('values')) + '</div>' +
                    '</div>';
            } else {
                return '<div class="variable-element"><div class="name">' + model.get('longName') + '</div></div>';
            }
        }).join('\n');

        this.el.innerHTML = elementsHTML;
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
        this.previewDataModel = options.previewDataModel;

        this.map = liteMap()
            .config({
                el: this.el,
                colorScale: colorBrewer.equalize(colorBrewer.Spectral[11])
            })
            .on('click', function(d) {
                that.trigger('click', d);
            });

        this.listenTo(this.previewDataModel, 'change', this.render);
    },

    render: function(model) {
        var data = model.toJSON();
        this.map.config({
                nullValue: NaN
            })
            .render().renderRaster(data);
    }
});

//TODO
var ChartView = Backbone.View.extend({

    initialize: function(options) {
        var that = this;
        this.previewDataModel = options.previewDataModel;

        this.map = liteMap()
            .config({
                el: this.el,
                colorScale: colorBrewer.equalize(colorBrewer.Spectral[11])
            })
            .on('click', function(d) {
                that.trigger('click', d);
            });

        this.listenTo(this.previewDataModel, 'change', this.render);
    },

    render: function(model) {
        var data = model.toJSON();
        this.map.config({
                nullValue: NaN
            })
            .render().renderRaster(data);
    }
});
