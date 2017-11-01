
import urllib.request
import simplejson as json
import pandas as pd

server = "http://api.planetos.com/v1/datasets/"
def generate_point_api_query(server, dataset_key, longitude, latitude, API_key, count=100000, z='all',verbose = 'False', **kwargs):
    returl = server + dataset_key + "/point?lat={0}&lon={1}&apikey={2}&count={3}&z={4}&verbose={5}".format(latitude,longitude,API_key,count,z,verbose)
    for i,j in kwargs.items():
        returl += "&{0}={1}".format(i,j)
    return returl

def read_data_to_json(req_url):
    return json.loads(urllib.request.urlopen(req_url).read().decode('utf-8'))     

def convert_json_to_some_pandas(injson):
    param_list = ['axes','data']
    new_dict = {}
    [new_dict.update({i:[]}) for i in param_list]
    [(new_dict['axes'].append(i['axes']),new_dict['data'].append(i['data'])) for i in injson];
    pd_temp = pd.DataFrame(injson)
    dev_frame = pd_temp[['context','axes']].join(pd.concat([pd.DataFrame(new_dict[i]) for i in param_list],axis=1))
    return dev_frame

def get_units(dataset_key, variable,API_key):
    query = server +'{0}/variables?apikey={1}&variables={2}'.format(dataset_key,API_key,variable)
    json = read_data_to_json(query)['variables']
    attributes = [u['attributes'] for u in json][0]
    uns = [v['attributeValue'] for v in attributes if v['attributeKey'] == 'units'][0]
    return uns

def get_data_from_point_API(dataset_key, longitude, latitude, API_key):
    
    data = convert_json_to_some_pandas(read_data_to_json(generate_point_api_query(server, dataset_key, longitude, latitude, API_key))['entries'])
    return data