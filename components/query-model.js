var PreviewQueryModel = Backbone.Model.extend({
    defaults: {
        baseURL: 'http://api.planetos.com/v1/datasets/',
        datasetName: 'noaa_gfs_global_sflux_0.12d',
        lon: 0,
        lat: 0,
        apiKey: 'a7017583aeb944d2b8bfec81ff9a2363',
        isVerbose: true,
        context: null,
        count: null
    }
});
