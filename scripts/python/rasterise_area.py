"""Rasterise PlanetOS Datahub API dataset query into animation
Usage:
  rasterise.py <DATASET_ID> <variable_name> <polygon_string> [--apikey=<APIKEY>] [--days=2]

  To skip use of --apikey option you can set PLANETOS_APIKEY environment variable.

  Example of <polygon_string>:
  '[[-125.288,45.198],[-125.288,49.710],[-121.047,49.710],[-121.047,45.198],[-125.288,45.198]]'

"""
try:
    import slumber
    import numpy as np
    import pandas as pd
    import matplotlib.pyplot as plt
    import seaborn as sns
    from docopt import docopt
except ImportError:
    print('Some required Python modules are missing.\nPlease run `pip install slumber docopt pandas matplotlib seaborn`\nOr use PIP requirements file: https://github.com/planet-os/demos/tree/master/scripts/python/requirements.txt')
    exit()

import os
from slumber.exceptions import HttpClientError
from pandas.io.json import json_normalize
from matplotlib.animation import FuncAnimation
from matplotlib.ticker import MultipleLocator, FormatStrFormatter
from datetime import timedelta, datetime


FLOAT_FORMAT = '.2f'
APIKEY = ''
POLYGON = ''
DATASET_ID = ''
VARIABLE = None
PAGESIZE = 1  # timestamps per request

if 'PLANETOS_APIKEY' in os.environ:
    APIKEY = os.environ['PLANETOS_APIKEY']

API = slumber.API('http://api.planetos.com/v1/', append_slash=False, format='json')


def fetch_metadata():
    return API.datasets(DATASET_ID).get(apikey=APIKEY)

def fetch_layer(page=0, max_page=None, start_time=None, end_time=None):
    while True:
        print ("fetching page: %s" % page)

        kwargs = dict()

        if start_time is not None:
            kwargs.update({'start': start_time.isoformat()})
        if end_time is not None:
            kwargs.update({'end': end_time.isoformat()})

        try:
            res = API.datasets(DATASET_ID).area().get(
                apikey=APIKEY,
                polygon=POLYGON,
                count=PAGESIZE,
                var=VARIABLE,
                offset=PAGESIZE * page,
                grouping='location',
                **kwargs
            )
        except HttpClientError as er:
            print("API query is failed: %s\nError: %s" % (er.response.url, er.response.content))
            return

        yield res

        if max_page is not None and page > max_page:
            return
        if 'stats' in res and 'nextOffset' in res['stats']:
            page += 1
        else:
            return

def update_frame(i):
    plt.clf()
    key, heatmap_data = next(data_frames_iterator)
    print(u'Saving frame #%s (%s)' % (i, key))
    # make it latitude-sorted (top > bottom == north > south)
    heatmap_data.sort_index(inplace=True, ascending=False)
    # nx, ny = heatmap_data.T.shape
    ax = sns.heatmap(
        heatmap_data,
        annot=False,
        vmin=data_min,
        vmax=data_max,
        fmt=FLOAT_FORMAT,
        cmap='jet',
        linewidths=.5,
        xticklabels=5,
        yticklabels=10
    )

    ax.set_title(u'%s\n%s (%s)\n%s' % (metadata['Title'], variable_meta['longName'], variable_meta['unit'], key))
    yvals = ax.get_yticklabels()
    ax.set_yticklabels([format(float(y.get_text()), FLOAT_FORMAT) for y in yvals])
    xvals = ax.get_xticklabels()
    ax.set_xticklabels([format(float(x.get_text()), FLOAT_FORMAT) for x in xvals])


# main routine
if __name__ == '__main__':
    arguments = docopt(__doc__)

    APIKEY = arguments['--apikey']
    VARIABLE = arguments['<variable_name>']
    DATASET_ID = arguments['<DATASET_ID>']
    POLYGON = arguments['<polygon_string>']
    days = float(arguments['--days']) or 2

    # init root data structures
    full_data_frame = pd.DataFrame()
    full_data_dict = dict()

    metadata = fetch_metadata()

    start_time = None
    end_time = None

    # for observational data we might need time limit
    # for forecast API limit to a single forecast run by default
    if metadata['ProductType'] in ['Observation', 'Analysis']:
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(days=days)
    else:
        start_time = datetime.utcnow()
        end_time = start_time + timedelta(days=days)

    print('Dataset type: %s' % metadata['ProductType'])
    print('Exact start/end period: %s - %s' % (start_time.isoformat(), end_time.isoformat()))

    for frame in fetch_layer(start_time=start_time, end_time=end_time):
        layer = frame['entries'][0]  # FIXME: works only when PAGESIZE == 1
        layer_coords = dict()
        for layer_coord in layer['indexAxes']:
            layer_coords[layer_coord[0]] = layer_coord[1]

        assert 'latitude' in layer_coords
        assert 'longitude' in layer_coords

        data_page = pd.DataFrame(layer['data'][VARIABLE], index=layer_coords['latitude'], columns=layer_coords['longitude'])

        full_data_dict[layer['axes']['time']] = data_page

    full_data_panel = pd.Panel(full_data_dict)

    data_min = np.nanmin(full_data_panel.values)
    data_max = np.nanmax(full_data_panel.values)

    # data_frames_by_date = full_data_frame.groupby('axes.time')
    data_frames_iterator = full_data_panel.iteritems()

    variable_meta = next(v for v in metadata['Variables'] if v['name'] == VARIABLE)

    fig = plt.figure()

    filename = '%s %s heatmap.gif' % (DATASET_ID, VARIABLE)

    anim = FuncAnimation(fig, update_frame, frames=len(full_data_panel)-1, interval=500)
    anim.save(filename, writer='imagemagick')

    print(u"%s is saved in current directory" % filename)
