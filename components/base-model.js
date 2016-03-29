var BaseCollection = Backbone.Collection.extend({
    url: function() {
        var q = this.pointQueryModel.toJSON();
        var url = q.baseURL + q.datasetName + '/point?apikey=' + q.apiKey;
        if(q.lon !== null && q.lat !== null) {
            url += '&lon=' + q.lon + '&lat=' + q.lat;
        }
        if(q.isVerbose !== null) {
            url += '&verbose=' + q.isVerbose;
        }
        if(q.context !== null) {
            url += '&context=' + q.context;
        }
        if(q.count !== null) {
            url += '&count=' + q.count;
        }

        console.log('Data query', url);
        return url;
    }
});
