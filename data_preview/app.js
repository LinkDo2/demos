/*
TODO
- wrap models (preview data, preview metadata, point data, query builder, hash state)
-wrap views (map, list, details, charts)
*/

var queryModel = new PreviewQueryModel();

var metadataCollection = new MetadataCollection({
        queryModel: queryModel
    });
metadataCollection.fetch({
        success: function(collection, response) {
            console.log('metadata', collection);
        }
    });

var dataCollection = new DataCollection({
        queryModel: queryModel
    });

var dataPreviewMap = liteMap()
    .config({
        el: document.querySelector('.container'),
        colorScale: colorBrewer.equalize(colorBrewer.Spectral[11])
    })
    .on('click', function(d) {
        queryModel.set({
            lon: d[0],
            lat: d[1],
            context: 'reftime_time_lat_lon',
            count: 2
        });

        dataCollection.fetch({
            success: function(collection, response) {
                console.log('data', collection);
            }
        });
    });

// var threddsURL = 'http://thredds.planetos.com/thredds/dodsC/dpipe//rel_0_6x11_dataset/transform/scheme=/ftp/authority=/ftp.ncep.noaa.gov/path=/pub/data/nccf/com/gfs/prod/gfs.2016031606/gfs.t06z.sfluxgrbf237.grib2/chunk=/1/0/preview';
// var threddsURL = 'http://thredds.planetos.com/thredds/dodsC/dpipe//rel_0_6x11_dataset/transform/scheme=/ftp/authority=/ftp.ncep.noaa.gov/path=/pub/data/nccf/com/gfs/prod/gfs.2016031612/gfs.t12z.sfluxgrbf135.grib2/chunk=/1/0/preview'
// var threddsURL = 'http://thredds.planetos.com/thredds/dodsC/dpipe//rel_0_6x11_dataset/transform/scheme=/ftp/authority=/ftp.ncep.noaa.gov/path=/pub/data/nccf/com/gfs/prod/gfs.2016031512/gfs.t12z.sfluxgrbf252.grib2/chunk=/1/0/preview'

var threddsURL = 'http://thredds.planetos.com/thredds/dodsC/dpipe//rel_0_6x11_dataset/transform/scheme=/ftp/authority=/ftp.ncep.noaa.gov/path=/pub/data/nccf/com/gfs/prod/gfs.2016031706/gfs.t06z.sfluxgrbf252.grib2/chunk=/1/0/preview'

var variableName = 'Maximum_temperature_height_above_ground_12_Hour_Interval';
// var variableName = 'Land_cover_0__sea_1__land_surface';
var dimensionFilters = [
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 287],
    [0, 1, 575]
];

var variables = {};
// jsdap.loadDataset(threddsURL, function(d) {
//     for(var dB in d) {
//         var value = d[dB];
//         if(value.attributes && value.attributes._mx_is_data) {
//             var dimensions = {};
//             value.array.dimensions.forEach(function(dC, iC) {
//                 dimensions[dC] = value.array.shape[iC];
//             });
//             variables[dB] = {
//                 name: value.name,
//                 longName: value.attributes.long_name.replace(/"/gi, ''),
//                 abbreviatedName: value.attributes.abbreviation.replace(/"/gi, ''),
//                 type: value.type,
//                 dimensions: dimensions,
//                 units: value.attributes.units.replace(/"/gi, ''),
//                 missingValue: (typeof value.attributes.missing_value !== 'undefined') ? value.attributes.missing_value : value.attributes._FillValue
//             };
//         }
//     }
//     console.log('variables: ', variables);
//     var list = document.querySelector('.variables');
//     var listElementsHTML = Object.keys(variables).map(function(d) {
//         return '<li><a href="#' + d + '">' + d + '</a></li>';
//     }).join('\n');
//
//     list.innerHTML = listElementsHTML;
// });

var dataPreviewDods = threddsURL + '.dods?' + variableName + dimensionFilters.map(function(d) {
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
    // console.log('preview data: ', data);
    dataPreviewMap.config({
        nullValue: NaN
    }).render().renderRaster(data);
});

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
