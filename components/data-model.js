var DataModel = Backbone.Model.extend({
    defaults: {
        key: null,
        values: null
    }
});

var DataCollection = BaseCollection.extend({

    model: DataModel,

    initialize: function(options) {
        this.queryModel = options.queryModel;

        this.listenTo(this.queryModel, 'change', function() {
            this.fetch({
                reset: true
            });
        });
    },

    parse: function(response) {
        var dataObj = {};
        for(var entry in response.entries) {
            var values = response.entries[entry].data;
            for(var value in values) {
                if(!dataObj[value]) {
                    dataObj[value] = [];
                }
                dataObj[value].push(values[value]);
            }
        }

        var data = [];
        for(var key in dataObj) {
            data.push({
                key: key,
                values: dataObj[key]
            });
        }

        console.log('DataCollection', '\nraw: ', response, '\nparsed: ', data);

        return data;
    }
});
