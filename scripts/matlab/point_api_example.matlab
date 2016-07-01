% A simple Matlab example that shows how to use Point API and dataset metadata
% to iterate over a list of variables while plotting them.
% please copy/paste your personal API key
% from http://data.planetos.com/account/settings/
apikey = ''
dataset_id = 'noaa_ww3_global_1.25x1d'
api_root_url = 'http://api.planetos.com/v1/'

% format API endpoint urls
dataset_meta_url = sprintf('%sdatasets/%s', api_root_url, dataset_id)
dataset_point_url = sprintf('%sdatasets/%s/point', api_root_url, dataset_id)
% read metadata and data samples
metadata = webread(dataset_meta_url, 'apikey', apikey)
rest_data = webread(dataset_point_url, 'apikey', apikey,'lat', 35.9073926681,'lon', -6.1876466940,'count', 50)
% extract list of variables with measurements
% (there are also helper variables which we don't need)
data_variables_idxes = arrayfun(@(x) x.isData, metadata.Variables)
data_variables = metadata.Variables(data_variables_idxes)
% extract and normalise timestamps
timestamps = arrayfun(@(x) x.axes.time, rest_data.entries, 'UniformOutput', false)
timestamps_norm = datetime(timestamps, 'InputFormat', 'uuuu-MM-dd''T''HH:mm:ss','TimeZone','UTC')

total_variables = numel(data_variables)

% iterate over the variable list
for idx = 1:total_variables
    % cache current variable details (long name, unit, etc)
    var_details = data_variables(idx)
    % check if our sample contains current variable
    measurement_idxes = arrayfun(@(d) isfield(d.data, var_details.name), rest_data.entries)
    entries_data = [rest_data.entries(measurement_idxes).data]

    if numel(entries_data) > 0
        % extract an array of values by current variable name
        var_measurements = [entries_data.(var_details.name)]
        % match timestamps for current variable values
        timestamps_plot = timestamps_norm(measurement_idxes)

        % just double check that sizes of timestamp and current variable values arrays identical
        if numel(timestamps_plot) == numel(var_measurements)
            figure
            plot(timestamps_plot, var_measurements)
            title({metadata.Title;sprintf('%s (%s)', var_details.longName, var_details.unit)})
            ylabel(var_details.unit)
        end
    end
end
