/*
TODO
-wrap views (map, list, details, charts)
*/

var queryModel = new DataQueryModel();
var previewModel = new PreviewQueryModel();

var metadataCollection = new MetadataCollection({
        queryModel: queryModel
    });
metadataCollection.fetch({
        success: function(collection, response) {
            console.log('metadata', collection);

            var variableNames = collection.map(function(d){ return d.get('name'); });
            var list = document.querySelector('.variables');
                var listElementsHTML = variableNames.map(function(d) {
                    return '<li><a href="#' + d + '">' + d + '</a></li>';
                }).join('\n');

                list.innerHTML = listElementsHTML;
        }
    });

var dataCollection = new DataCollection({
        queryModel: queryModel
    });

var previewDataCollection = new PreviewDataCollection({
        queryModel: previewModel
    });
previewDataCollection.fetch({
        success: function(data, response) {
            console.log('preview data', data);

            dataPreviewMap.config({
                    nullValue: NaN
                })
                .render().renderRaster(data);
        }
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
                console.log('point data', collection);
            }
        });
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
