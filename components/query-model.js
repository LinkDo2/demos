var DataQueryModel = Backbone.Model.extend({
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

var PreviewQueryModel = Backbone.Model.extend({
    defaults: {
        threddsURL: 'http://thredds.planetos.com/thredds/dodsC/dpipe//',
        releaseVersion: 'rel_0_6x11_dataset/transform/',
        scheme: 'scheme=/ftp/',
        authority: 'authority=/ftp.ncep.noaa.gov/',
        path: 'path=/pub/data/nccf/com/gfs/prod/gfs.2016031706/gfs.t06z.sfluxgrbf252.grib2/',
        chunk: 'chunk=/1/0/preview',
        variableName: 'Maximum_temperature_height_above_ground_12_Hour_Interval',
        dimensionFilters: [
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 287],
            [0, 1, 575]
        ]
    }
});
