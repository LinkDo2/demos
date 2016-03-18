var PreviewDataModel = Backbone.Model.extend({
    defaults: {
        context: null,
        key: null,
        longName: null,
        missingValue: null,
        name: null,
        units: null,
        abbreviation: null
    }
});

var PreviewDataCollection = Backbone.Collection.extend({

    url: '',

    model: PreviewDataModel,

    initialize: function(options) {
        this.query = options.queryModel;
    },

    fetch: function(callbacks){
        var q = this.query.toJSON();

        var dataPreviewDods = q.threddsURL + q.releaseVersion + q.scheme + q.authority + q.path + q.chunk + '.dods?' + q.variableName + q.dimensionFilters.map(function(d) {
            return '[' + d.join(':') + ']';
        }).join('') + ',time1';

        jsdap.loadData(dataPreviewDods, function(d) {
            var dimensionCount = dimensionFilters.length;
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
            callbacks.success(data);
        });
    },

    parse: function(response) {

        return response;
    }
});
