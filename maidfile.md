# create-ts-index

## test
execute test case from create-ts-index

```bash
NODE_ENV=develop DEBUG=ctit:* jest ${@:1}
```

## debug
```bash
node --require ts-node/register --inspect-brk=9229 ./node_modules/.bin/jest --no-cache --runInBand --detectOpenHandles ${@:1}
```