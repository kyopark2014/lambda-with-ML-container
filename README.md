# Container를 이용하여 Lambda로 ML inference 구현하기 


## Wine Quality을 측정하는 머신러닝 알고리즘 

1) 데이터의 준비

[Wine Quality Data Set](https://archive.ics.uci.edu/ml/datasets/wine+quality)은 [XGBoost를 이용한 Wine Quality](https://github.com/kyopark2014/ML-Algorithms/tree/main/kaggle/xgboost-wine-quality)에서 [xgboost-wine-quality-EDA.ipynb](https://github.com/kyopark2014/ML-Algorithms/blob/main/kaggle/xgboost-wine-quality/xgboost-wine-quality-EDA.ipynb)을 통해 [특성공학(Feature Engineering)](https://github.com/kyopark2014/ML-Algorithms/blob/main/feature-enginnering.md)을 적용하여, [wine_concat.csv](https://github.com/kyopark2014/ML-Algorithms/blob/main/kaggle/xgboost-wine-quality/data/wine_concat.csv)로 변환됩니다.

2) XGBoost 알고리즘 최적화

[xgboost-wine-quality.ipynb](https://github.com/kyopark2014/ML-Algorithms/blob/main/kaggle/xgboost-wine-quality/xgboost-wine-quality.ipynb)은 [XGBoost](https://github.com/kyopark2014/ML-Algorithms/blob/main/xgboost.md)을 이용해 [회귀(Regression)](https://github.com/kyopark2014/ML-Algorithms/blob/main/regression.md)을 수행하는데, [HPO](https://github.com/kyopark2014/ML-Algorithms/blob/main/hyperparameter-optimization.md)을 통해 Hyperparamter를 최적화 합니다. 

3) 학습 (Training)

[Wine Quality (Regression)]에서는 jupyter notebook으로 작성된 XGBoost 알고리즘을 [xgboost-wine-quality.py](https://github.com/kyopark2014/ML-xgboost/blob/main/wine-quality/src/xgboost-wine-quality.py)와 같이 Python 코드로 변환한 후에, 학습을 수행합니다. 학습의 결과로 얻어진 모델은 [xgboost_wine_quality.json](https://github.com/kyopark2014/ML-xgboost/blob/main/wine-quality/src/xgboost_wine_quality.json)와 같이 저장됩니다. 

학습된 모델을 이용하여 [inference.py](https://github.com/kyopark2014/ML-xgboost/blob/main/wine-quality/src/inference.py)와 같이 추론을 수행할 수 있습니다.


## Lambda를 이용한 추론(Inference) 시스템 구성

대표적인 서버리스 서비스인 Lambda는 운영에 대한 부담을 줄여주고 사용한 만큼만 지불(Pay As You Go)할 수 있어요, 다양한 어플리케이션에 유용하게 활용할 수 있습니다. 특히, 2020년 12월부터 [Lambda가 Container이미지를 지원](https://aws.amazon.com/ko/blogs/korea/new-for-aws-lambda-container-image-support/)함으로써, Lambda를 머신러닝(Machine Learning)에도 유용하게 사용할 수 있게 되었습니다. 여기서는 Lambda를 머신러닝의 추론(Inference)에 활용하고자 합니다. 

머신러닝에 Lambda를 활용하기 위해서는 [inference.py](https://github.com/kyopark2014/ML-xgboost/blob/main/wine-quality/src/inference.py)와 학습된 모델인 [xgboost_wine_quality.json](https://github.com/kyopark2014/ML-xgboost/blob/main/wine-quality/src/xgboost_wine_quality.json)을 이용하여 Docker image를 생성한 후에 Lambda에서 활용하여야 합니다. 

[AWS CDK](https://github.com/kyopark2014/technical-summary/blob/main/cdk-introduction.md)는 대표적인 IaC(Infrastructure as Code) 툴로서, Docker Image를 빌드하고 [Amazon ECR](https://aws.amazon.com/ko/ecr/)에 업로드한 후 Lambda에서 활용할 수 있습니다. 또한, Lambda를 생성된 추론용 Rest API를 외부에서 접속할 수 있도록 [Lambda Functional URL](https://github.com/kyopark2014/lambda-function-url)을 활용합니다. 






## Reference 

[How do I use container images with Lambda?](https://aws.amazon.com/ko/premiumsupport/knowledge-center/lambda-container-images/)

[AWS Lambda의 새로운 기능 — 컨테이너 이미지 지원](https://aws.amazon.com/ko/blogs/korea/new-for-aws-lambda-container-image-support/)

[class DockerImageFunction (construct)](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-lambda.DockerImageFunction.html)

[AWS CDK: Deploy Lambda with Docker](https://sbstjn.com/blog/aws-cdk-lambda-docker-container-example/)
