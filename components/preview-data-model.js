var PreviewDataModel = Backbone.Model.extend({

    url: '',

    defaults: {
        lat: null,
        lon: null,
        values: null
    },

    initialize: function(options) {
        this.query = options.queryModel;
    },

    fetch: function(callbacks){
        var that = this;
        var q = this.query.toJSON();

        var dataPreviewDods = q.threddsURL + q.releaseVersion + q.scheme + q.authority + q.path + q.chunk + '.dods?' + q.variableName + q.dimensionFilters.map(function(d) {
            return '[' + d.join(':') + ']';
        }).join('') + ',time1';

        jsdap.loadData(dataPreviewDods, function(d) {
            var dimensionCount = d[0].length - 1;
            var lat = d[0][dimensionCount - 1];
            var lon = d[0][dimensionCount];
            var values = d;
            for(var i = 0; i < dimensionCount; i++) {
                values = values[0];
            }
            var data = {
                lat: lat,
                lon: lon,
                values: values
            }

            that.set(data);
            callbacks.success(data);
        });
    }
});
