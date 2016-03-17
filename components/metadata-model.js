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
        this.query = options.queryModel;
    },

    parse: function(response) {
        var contexts = response.metadata.contexts;
        var variables = [];
        for(var context in contexts) {
            var contextVariables = contexts[context].dataVariables;
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
                });
            }
        }

        return variables;
    }
});
