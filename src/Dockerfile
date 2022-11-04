# lambda base image (python)
FROM amazon/aws-lambda-python:3.8

RUN /var/lang/bin/python3.8 -m pip install --upgrade pip
RUN /var/lang/bin/python3.8 -m pip install joblib
RUN pip install --pre xgboost

WORKDIR /var/task/lambda-with-ML-container

COPY ml-xgboost.py /var/task/

COPY xgboost_wine_quality.json /var/task/

COPY . .

RUN pip install -r requirements.txt

CMD ["ml-xgboost.handler"]