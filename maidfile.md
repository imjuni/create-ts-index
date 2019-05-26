# create-ts-index

## test
execute test case from create-ts-index

```bash
cross-env NODE_ENV=develop DEBUG=ctit:* jest --runInBand ${@:1}
```

## debug
create-ts-index execute debugging mode 

```bash
cross-env NODE_ENV=develop DEBUG=ctit:* node --require ts-node/register --inspect-brk=9229 ./node_modules/.bin/jest --no-cache --runInBand --detectOpenHandles ${@:1}
```

## jestcov
display code coverage via jest

```
jest --runInBand --coverage
```

## codecov
execute codecov

```
codecov
```