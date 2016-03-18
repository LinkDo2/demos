var VariableListView = Backbone.View.extend({
    events: {},

    initialize: function(options) {
        this.metadataCollection = options.metadataCollection;

        this.listenTo(this.metadataCollection, 'change reset', this.render);
    },

    render: function(collection) {
        var variableNames = collection.map(function(d) {
            return d.get('name');
        });
        var list = document.querySelector('.variables');
        var listElementsHTML = variableNames.map(function(d) {
            return '<li><a href="#' + d + '">' + d + '</a></li>';
        }).join('\n');

        list.innerHTML = listElementsHTML;
    }
});

var MapView = Backbone.View.extend({
    events: {},

    initialize: function(options) {
        this.previewDataModel = options.previewDataModel;

        this.listenTo(this.previewDataModel, 'change', this.render);
    },

    render: function(model) {
        var data = model.toJSON();
        dataPreviewMap.config({
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
