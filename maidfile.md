# create-ts-index

## test
execute test case from create-ts-index

```sh
cross-env NODE_ENV=develop DEBUG=ctit:* jest --runInBand ${@:1}
```

## test:debug
create-ts-index execute debugging mode 

```sh
cross-env NODE_ENV=develop DEBUG=ctit:* node --require ts-node/register --inspect-brk=9229 ./node_modules/.bin/jest --no-cache --runInBand --detectOpenHandles ${@:1}
```

## debug
create-ts-index execute debugging mode 

```sh
cross-env NODE_ENV=develop DEBUG=ctit:* node --require ts-node/register --inspect-brk=9229 ${@:1}
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

## clean 
clean artifact directory

```sh
rimraf ./dist
```

## lint
```sh
tslint ./src/**/*.ts
```

## build
Run tasks `clean` `lint` before this

build create-ts-index

```sh
tsc
```

## pub
Run tasks `clean` `build` before this

publish create-ts-index package

```sh
npm publish
```