# package import
import numpy as np
import pandas as pd
from xgboost import XGBRegressor

def handler(event, context):
    print('event: ', event)

    body = event['body']
    print('body: ', body)

    values = pd.read_json((body))
    print('\nvalues: ',values)

    # load model    
    model = XGBRegressor()
    #model_name = "/var/task/lambda-with-ML-container/xgboost_wine_quality.json"    
    model_name = "xgboost_wine_quality.json"    

    print("model: ", model_name)

    model.load_model(model_name)
    print("The Model was loaded")

    # inference
    results = model.predict(values)
    print('result:', results)

    return {
        'statusCode': 200,
        'body': results.tolist()
    }
