# Container를 이용하여 Lambda로 ML inference 구현하기 

1) 데이터의 준비
[Wine Quality Data Set](https://archive.ics.uci.edu/ml/datasets/wine+quality)은 [XGBoost를 이용한 Wine Quality](https://github.com/kyopark2014/ML-Algorithms/tree/main/kaggle/xgboost-wine-quality)에서 [xgboost-wine-quality-EDA.ipynb](https://github.com/kyopark2014/ML-Algorithms/blob/main/kaggle/xgboost-wine-quality/xgboost-wine-quality-EDA.ipynb)을 통해 [특성공학(Feature Engineering)](https://github.com/kyopark2014/ML-Algorithms/blob/main/feature-enginnering.md)을 적용하여, [xgboost-wine-quality/data/wine_concat.csv](https://github.com/kyopark2014/ML-Algorithms/blob/main/kaggle/xgboost-wine-quality/data/wine_concat.csv)로 변환됩니다.

2) ㅇ
[xgboost-wine-quality.ipynb](https://github.com/kyopark2014/ML-Algorithms/blob/main/kaggle/xgboost-wine-quality/xgboost-wine-quality.ipynb)은 [XGBoost](https://github.com/kyopark2014/ML-Algorithms/blob/main/xgboost.md)을 이용해 [회귀(Regression)](https://github.com/kyopark2014/ML-Algorithms/blob/main/regression.md)을 수행하는데, [HPO](https://github.com/kyopark2014/ML-Algorithms/blob/main/hyperparameter-optimization.md)을 통해 Hyperparamter를 최적화 합니다. 
2) [xgboost-wine-quality.ipynb](https://github.com/kyopark2014/ML-Algorithms/blob/main/kaggle/xgboost-wine-quality/xgboost-wine-quality.ipynb)은 [XGBoost](https://github.com/kyopark2014/ML-Algorithms/blob/main/xgboost.md)을 이용해 [회귀(Regression)](https://github.com/kyopark2014/ML-Algorithms/blob/main/regression.md)을 수행하는데, [HPO](https://github.com/kyopark2014/ML-Algorithms/blob/main/hyperparameter-optimization.md)을 통해 Hyperparamter를 최적화 합니다. 

3) 

학습(Training)하여 생

It describes how to use container image for lambda deployment in order to use ML algorithms.


```python
FROM public.ecr.aws/lambda/python:3.8

# Copy function code
COPY app.py ${LAMBDA_TASK_ROOT}

# Install the function's dependencies using file requirements.txt
# from your project folder.

COPY requirements.txt .
RUN pip3 install -r requirements.txt —target "${LAMBDA_TASK_ROOT}"

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "app.handler" ]
```




## Reference 

[How do I use container images with Lambda?](https://aws.amazon.com/ko/premiumsupport/knowledge-center/lambda-container-images/)

[AWS Lambda의 새로운 기능 — 컨테이너 이미지 지원](https://aws.amazon.com/ko/blogs/korea/new-for-aws-lambda-container-image-support/)

[class DockerImageFunction (construct)](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-lambda.DockerImageFunction.html)

[AWS CDK: Deploy Lambda with Docker](https://sbstjn.com/blog/aws-cdk-lambda-docker-container-example/)
