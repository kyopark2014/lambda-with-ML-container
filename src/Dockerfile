# lambda base image (python)
FROM amazon/aws-lambda-python:3.8

RUN /var/lang/bin/python3.8 -m pip install --upgrade pip
RUN /var/lang/bin/python3.8 -m pip install joblib
RUN /var/lang/bin/python3.8 -m pip install scikit-learn

WORKDIR /var/task/lambda-with-ML-container

COPY inference.py /var/task/
COPY . .

RUN pip install -r requirements.txt

CMD ["inference.handler"]