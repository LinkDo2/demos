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


mapboxgl.accessToken = '!!! MY MAPBOX KEY HERE !!!';

var map = new mapboxgl.Map({
    container: 'map-container', // container id
    style: 'mapbox://styles/mapbox/streets-v9',
    center: [-74.50, 40], // starting position
    zoom: 6 // starting zoom
});

map.on('click', function (e) {
    pointMetadataQueryModel.set({
        lon: e.lngLat.lng,
        lat: e.lngLat.lat
    });

    pointDataQueryModel.set({
        lon: e.lngLat.lng,
        lat: e.lngLat.lat,
        count: 10
    });
});

var infoView = new InfoView({
    el: document.querySelector('.info-container'),
    pointDataCollection: pointDataCollection
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