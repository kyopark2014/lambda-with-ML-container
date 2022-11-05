# package import
import pandas as pd
from xgboost import XGBRegressor

# load model    
model = XGBRegressor()
model_name = "xgboost_wine_quality.json"    
model.load_model(model_name)

def handler(event, context):
    body = event['body']
    print('body: ', body)

    values = pd.read_json((body))
    print('\nvalues: ',values)

    # inference
    results = model.predict(values)
    print('result:', results)

    return {
        'statusCode': 200,
        'body': results.tolist()
    }
