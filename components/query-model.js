var DataQueryModel = Backbone.Model.extend({
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

var DataPreviewQueryModel = Backbone.Model.extend({
    defaults: {
        threddsURL: 'http://thredds.planetos.com/thredds/dodsC/dpipe//',
        releaseVersion: 'rel_0_6x11_dataset/transform/',
        scheme: null,
        authority: null,
        path: 'path=/pub/data/nccf/com/gfs/prod/',
        datasetName: null,
        chunk: 'chunk=/1/0/preview',
        variableName: null,
        dimensionFilters: []
    }
});
