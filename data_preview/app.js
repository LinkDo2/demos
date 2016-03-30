// Query Models
var pointDataQueryModel = new PointDataQueryModel();
var pointMetadataQueryModel = new PointDataQueryModel();
var opendapDataQueryModel = new OpendapDataPreviewQueryModel();
var opendapMetadataQueryModel = new OpendapDataPreviewQueryModel();

var pointMetadataCollection = new PointMetadataCollection({
    pointQueryModel: pointMetadataQueryModel,
    opendapDataQueryModel: opendapDataQueryModel
});

// Data models
var pointDataCollection = new PointDataCollection({
    pointQueryModel: pointDataQueryModel
});

var previewDataModel = new PreviewDataModel({
    opendapDataQueryModel: opendapDataQueryModel
});

var opendapMetadataCollection = new OpendapMetadataCollection({
    opendapMetadataQueryModel: opendapMetadataQueryModel
});

// Views
var pointVariableListView = new PointVariableListView({
    el: '.variable-container',
    pointMetadataCollection: pointMetadataCollection,
    pointDataCollection: pointDataCollection
});

var opendapVariableListView = new OpendapVariableListView({
    el: '.preview-variable-container',
    opendapMetadataCollection: opendapMetadataCollection
});

var mapView = new MapView({
        el: document.querySelector('.map-container'),
        previewDataModel: previewDataModel
    })
    .on('click', function(d) {
        pointMetadataQueryModel.set({
            lon: d[0],
            lat: d[1],
            apiKey: 'a7017583aeb944d2b8bfec81ff9a2363'
        });

        pointDataQueryModel.set({
            lon: d[0],
            lat: d[1],
            count: 10
        });
    });

// Fetch models
pointMetadataQueryModel.set({
    baseURL: 'http://api.planetos.com/v1/datasets/',
    datasetName: 'noaa_gfs_global_sflux_0.12d',
    lon: 0,
    lat: 0,
    apiKey: 'a7017583aeb944d2b8bfec81ff9a2363',
    isVerbose: true,
    context: null,
    count: null
});

pointDataQueryModel.set({
    baseURL: 'http://api.planetos.com/v1/datasets/',
    datasetName: 'noaa_gfs_global_sflux_0.12d',
    lon: 0,
    lat: 0,
    apiKey: 'a7017583aeb944d2b8bfec81ff9a2363',
    isVerbose: false,
    count: 10
});

opendapMetadataQueryModel.set({
    threddsURL: 'http://thredds.planetos.com/thredds/dodsC/dpipe//rel_0_6x11_dataset/transform/scheme=/ftp/authority=/ftp.ncep.noaa.gov/path=/pub/data/nccf/com/gfs/prod/gfs.2016032912/gfs.t12z.sfluxgrbf00.grib2/chunk=/1/0/preview'
});

opendapDataQueryModel.set({
    threddsURL: 'http://thredds.planetos.com/thredds/dodsC/dpipe//rel_0_6x11_dataset/transform/scheme=/ftp/authority=/ftp.ncep.noaa.gov/path=/pub/data/nccf/com/gfs/prod/gfs.2016032912/gfs.t12z.sfluxgrbf00.grib2/chunk=/1/0/preview',
    variableName: 'Geopotential_height_hybrid',
    dimensionFilters: [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 383],
        [0, 1, 767]
    ]
});

var variableDetailsNode = document.querySelector('.variable-details');
window.addEventListener("hashchange", function() {
    var variableName = window.location.hash.replace('#', '');
    var modelFromName = opendapMetadataCollection.filter(function(d){ return variableName === d.get('key'); })[0];

    var dimensions = modelFromName.get('dimensions');
    var dimensionFilters = [];
    for(var dimension in dimensions) {
        var max = (dimension === 'lat' || dimension === 'lon') ? dimensions[dimension] - 1: 0;
        dimensionFilters.push([0, 1, max]);
    }

    opendapDataQueryModel.set({
        variableName: modelFromName.get('key'),
        dimensionFilters: dimensionFilters
    });
});
