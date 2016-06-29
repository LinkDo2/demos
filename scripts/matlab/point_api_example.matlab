% A simple Matlab example that shows how to use Point API and dataset metadata
% to iterate over a list of variables while plotting them.
% please copy/paste your personal API key
% from http://data.planetos.com/account/settings/
apikey = 'cf445e00eeb643db918e9ded2eb2ff83'
dataset_id = 'noaa_ww3_global_1.25x1d'
api_root_url = 'http://api.planetos.com/v1/'

dataset_meta_url = sprintf('%sdatasets/%s', api_root_url, dataset_id)
dataset_point_url = sprintf('%sdatasets/%s/point', api_root_url, dataset_id)

metadata = webread(dataset_meta_url, 'apikey', apikey)
rest_data = webread(dataset_point_url, 'apikey', apikey,'lat', 35.9073926681,'lon', -6.1876466940,'count', 50)

data_variables_idxes = arrayfun(@(x) x.isData, metadata.Variables)
data_variables = metadata.Variables(data_variables_idxes)

timestamps = arrayfun(@(x) x.axes.time, rest_data.entries, 'UniformOutput', false)
timestamps_norm = datetime(timestamps, 'InputFormat', 'uuuu-MM-dd''T''HH:mm:ss','TimeZone','UTC')

total_variables = numel(data_variables)
screen_size = get(groot,'ScreenSize')


for idx = 1:total_variables
    var_details = data_variables(idx)
    measurement_idxes = arrayfun(@(d) isfield(d.data, var_details.name), rest_data.entries)
    entries_data = [rest_data.entries(measurement_idxes).data]

    if numel(entries_data) > 0
        var_measurements = [entries_data.(var_details.name)]
        timestamps_plot = timestamps_norm(measurement_idxes)

        if numel(timestamps_plot) == numel(var_measurements)
            figure
            plot(timestamps_plot, var_measurements)
            title({metadata.Title;sprintf('%s (%s)', var_details.longName, var_details.unit)})
            ylabel(var_details.unit)
        end
    end
end
