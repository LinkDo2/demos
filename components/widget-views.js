var VariableListView = Backbone.View.extend({

    events: {},

    initialize: function(options) {
        this.metadataCollection = options.metadataCollection;

        this.listenTo(this.metadataCollection, 'reset', this.render);
    },

    render: function(collection) {
        var variableNames = collection.map(function(d) {
            return d.get('longName');
        });
        var list = document.querySelector('.variables');
        var listElementsHTML = variableNames.map(function(d) {
            return '<li><a href="#' + d + '">' + d + '</a></li>';
        }).join('\n');

        list.innerHTML = listElementsHTML;
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

var MetadataView = Backbone.View.extend({

    events: {},

    initialize: function(options) {
        // this.previewDataModel = options.previewDataModel;
        //
        // this.listenTo(this.previewDataModel, 'change', this.render);
    },

    render: function(model) {

    }
});
