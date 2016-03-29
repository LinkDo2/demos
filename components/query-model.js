var PointDataQueryModel = Backbone.Model.extend({
    defaults: {
        baseURL: 'http://api.planetos.com/v1/datasets/',
        datasetName: null,
        lon: 0,
        lat: 0,
        apiKey: null,
        isVerbose: null,
        context: null,
        count: null
    }
});

var OpendapDataPreviewQueryModel = Backbone.Model.extend({
    defaults: {
        threddsURL: 'http://thredds.planetos.com/thredds/dodsC/dpipe//',
        variableName: null,
        dimensionFilters: []
    }
});
