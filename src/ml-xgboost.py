# package import
import numpy as np

from xgboost import XGBRegressor

# load model    
model = XGBRegressor()
#model_name = "/var/task/lambda-with-ML-container/xgboost_wine_quality.json"    
model_name = "xgboost_wine_quality.json"    
print("model: ", model_name)

model.load_model(model_name)

def handler(event, context):
    body = event["body-json"]
    print('body: ', body)

    # inference
    results = model.predict(body)
    print('result:', results)

    return {
        'statusCode': 200,
        'body': results.tolist()
    }
