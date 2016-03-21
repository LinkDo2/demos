var VariableListView = Backbone.View.extend({

    initialize: function(options) {
        this.metadataCollection = options.metadataCollection;
        this.dataCollection = options.dataCollection;

        this.listenTo(this.metadataCollection, 'reset', this.render);
        this.listenTo(this.dataCollection, 'reset', this.render);
    },

    render: function(collection) {
        var elementsHTML = this.metadataCollection.map(function(model) {
            var data = this.dataCollection.filter(function(d) {
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

var PreviewVariableListView = Backbone.View.extend({

    initialize: function(options) {
        this.metadataCollection = options.metadataCollection;

        this.listenTo(this.metadataCollection, 'reset', this.render);
    },

    render: function(collection) {
        var elementsHTML = this.metadataCollection.map(function(model) {
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
