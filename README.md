# Report Service

- Pongpong의 Report service
- Endpoint check 결과를 저장한다.
- 조건에 따른 Endpoint 상태를 Report 형태로 제공한다.

## Development setup
```
$ docker-compose up
```
- api server: http://127.0.0.1:8000
- db server: http://127.0.0.1:8529

## Lint code
```
$ docker-compose exec app npm run lint
```

## Unit test
```
$ docker-compose exec app npm test
```

## Deployment using Kubernetes
```
$ kubectl create -f k8s/report-service.yml
```
