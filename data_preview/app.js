var dataQueryModel = new DataQueryModel();
var dataPreviewQueryModel = new DataPreviewQueryModel();

var metadataCollection = new MetadataCollection({
    queryModel: dataQueryModel
});

var activeMetadataModel = new ActiveMetadataModel({
    queryModel: dataQueryModel,
    metadataCollection: metadataCollection
});

var dataCollection = new DataCollection({
    queryModel: dataQueryModel
});

var previewDataModel = new PreviewDataModel({
    queryModel: dataPreviewQueryModel
});

var variableListView = new VariableListView({
    metadataCollection: metadataCollection
});

var mapView = new MapView({
        el: document.querySelector('.container'),
        previewDataModel: previewDataModel
    })
    .on('click', function(d) {
        dataQueryModel.set({
            lon: d[0],
            lat: d[1],
            context: 'reftime_time_lat_lon',
            count: 2
        });

        dataCollection.fetch({
            success: function(collection, response) {
                console.log('point data', collection);
            }
        });
    });

var MetadataView = new MetadataView({});

dataQueryModel.set({
    baseURL: 'http://api.planetos.com/v1/datasets/',
    datasetName: 'noaa_gfs_global_sflux_0.12d',
    lon: 0,
    lat: 0,
    apiKey: 'a7017583aeb944d2b8bfec81ff9a2363',
    isVerbose: true,
    context: null,
    count: null
});

dataPreviewQueryModel.set({
    threddsURL: 'http://thredds.planetos.com/thredds/dodsC/dpipe//',
    releaseVersion: 'rel_0_6x11_dataset/transform/',
    scheme: 'scheme=/ftp/',
    authority: 'authority=/ftp.ncep.noaa.gov/',
    path: 'path=/pub/data/nccf/com/gfs/prod/',
    datasetName: 'gfs.2016031706/gfs.t06z.sfluxgrbf252.grib2/',
    chunk: 'chunk=/1/0/preview',
    variableName: 'Maximum_temperature_height_above_ground_12_Hour_Interval',
    dimensionFilters: [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 287],
        [0, 1, 575]
    ]
});

// metadataCollection.fetch({
//     success: function(collection, response) {
//         console.log('metadata', collection);
//     },
//     reset: true
// });

// previewDataModel.fetch({
//     success: function(data, response) {
//         console.log('preview data', data);
//     },
//     reset: true
// });

var variableDetailsNode = document.querySelector('.variable-details');
window.addEventListener("hashchange", function() {
    var variableName = window.location.hash.replace('#', '');
    var variableDetails = variables[variableName];
    var variableDetailsHTML = '<ul>';
    for(var detail in variableDetails) {
        variableDetailsHTML += '<li>' + detail + ': ' + JSON.stringify(variableDetails[detail]) + '</li>'
    }
    variableDetailsHTML += '</ul>';
    variableDetailsNode.innerHTML = variableDetailsHTML;

    var dimensions = variableDetails.dimensions;
    var dimensionFilters = [];
    for(var dimension in dimensions) {
        var max = (dimension === 'lat' || dimension === 'lon') ? dimensions[dimension] - 1 : 0;
        dimensionFilters.push([0, 1, max]);
    }
    var dataPreviewDods = threddsURL + '.dods?' + variableName + dimensionFilters.map(function(d) {
        return '[' + d.join(':') + ']';
    }).join('') + ',time1';

    console.log('query from hash', dataPreviewDods);
});
