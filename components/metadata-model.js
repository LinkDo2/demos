var MetadataModel = Backbone.Model.extend({
    defaults: {
        context: null,
        key: null,
        longName: null,
        missingValue: null,
        name: null,
        units: null,
        abbreviation: null
    }
});

var MetadataCollection = BaseCollection.extend({

    model: MetadataModel,

    initialize: function(options) {
        this.queryModel = options.queryModel;
        this.listenTo(this.queryModel, 'change set', function() {
            this.fetch({
                reset: true
            });
        });

        this.dataPreviewQueryModel = options.dataPreviewQueryModel;
        this.activeVariableName = null;
        this.listenTo(this.dataPreviewQueryModel, 'change:variableName', function(model, variableName) {
            this.activeVariableName = variableName;
        });
    },

    getActiveModel: function(){
        var that = this;
        var activeModel = this.filter(function(d){ return d.get('key') === that.activeVariableName; })[0];
        return activeModel;
    },

    parse: function(response) {
        var contexts = response.metadata.contexts;
        var variables = [];
        for(var context in contexts) {
            var contextVariables = contexts[context].dataVariables;
            var coordinates = contexts[context].coordinateVariables;
            for(var variable in contextVariables) {
                var metadata = contextVariables[variable];
                var missingValue = (typeof metadata.missing_value !== 'undefined') ? metadata.missing_value : value.attributes._FillValue
                if(missingValue === 'NaN') {
                    missingValue = NaN
                }
                variables.push({
                    context: context,
                    key: variable,
                    longName: metadata.long_name,
                    missingValue: missingValue,
                    name: metadata.standard_name,
                    units: metadata.units,
                    abbreviation: metadata.abbreviation,
                    coordinates: coordinates
                });
            }
        }

        console.log('MetadataCollection', '\nraw:', response, '\nparsed: ', variables);
        console.log(JSON.stringify(variables.map(function(d, i){ return d.key; }).sort()));

        return variables;
    }
});
