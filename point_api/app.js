// Query Models
var pointDataQueryModel = new PointDataQueryModel();
var pointMetadataQueryModel = new PointDataQueryModel();

var pointMetadataCollection = new PointMetadataCollection({
    pointQueryModel: pointMetadataQueryModel
});

// Data models
var pointDataCollection = new PointDataCollection({
    pointQueryModel: pointDataQueryModel
});

// Views
var pointVariableListView = new PointVariableListView({
    el: '.variable-container',
    pointMetadataCollection: pointMetadataCollection,
    pointDataCollection: pointDataCollection
});

var mapView = new MapView({
        el: document.querySelector('.map-container')
    })
    .on('click', function(d) {
        pointMetadataQueryModel.set({
            lon: d[0],
            lat: d[1]
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