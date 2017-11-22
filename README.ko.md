create-ts-index
----

# 설치
```
npm install create-ts-index --save-dev
```

# 소개
TypeScript 프로젝트를 개발할 때 export를 위한 index.ts 파일을 생성합니다. index.ts 파일을 export 용도로만 사용하거나 라이브러리 프로젝트를 개발할 때 유용합니다. 예를들면 [blueprint.js](http://blueprintjs.com/)와 같은 라이브러리 프로젝트를 개발한다면 컴포넌트를 다른 프로젝트에서 사용할 수 있도록 모든 파일을 export 해야 합니다. 이런 경우 create-ts-index를 아주 유용하게 사용할 수 있습니다. 라이브러리 프로젝트가 아니라도, create-ts-index를 사용해서 export 용 index.ts 파일을 사용한다면 import 구문을 간단하게 만들 수 있고 협업할 때 import 형식에 대한 고민을 줄일 수 있어서 유용합니다.

예를들어, 아래와 같은 디렉터리가 있다고 가정합시다.

```
  src/
    app.ts
    component/
      Nav.ts
      Button.ts
```

create-ts-index 는 아래와 같이 export index.ts 파일을 생성합니다.

```
  src/
    app.ts
    > index.ts
      // created from 'create-ts-index'
      export * from './component';
      export * from './app';
    component/
      Nav.ts
      Button.ts
      > index.ts
        // created from 'create-ts-index'
        export * from './Nav';
        export * from './Button';
```

# 옵션
## 라이브러리로 사용할 경우
* `fileFirst?: boolean` 생성되는 export 파일내용에서 파일이름을 먼저 export 할지 디렉터리 이름을 먼저 export 할지 결정합니다. 기본 값은 `false` 입니다.
* `addNewline?: boolean` 파일 마지막에 줄바꿈 문자를 추가할지 말지를 결정합니다. 기본 값은 `true` 입니다.
* `useSemicolon?: boolean` 줄 마지막에 `;` 문자를 추가할지 말지를 결정합니다. 기본 값은 `true` 입니다.
* `useTimestamp?: boolean` 파일 처음에 주석을 작성할 때 시간(YYYY-MM-DD HH:mm 형식)을 추가할지 말지를 결정합니다. 기본 값은 `false` 입니다.
* `excludes?: string[]` 제외할 디렉터리를 전달합니다. 기본 값은 `['@types', 'typings', '__test__', '__tests__']` 입니다.
* `targetExts?: string[]` export 구문을 생성할 때 사용할 확장자명을 전달합니다. 기본 값은 `['ts', 'tsx']` 입니다. 확장자명을 전달할 때는 예와같이 점 문자를 제외하고 전달해야합니다.
* `globOptions?: glob.IOptions` [node-glob](https://github.com/isaacs/node-glob) 옵션 값을 전달할 수 있습니다. 자세한 내용은 링크문서를 참고하세요.

## CLI(command-line interface)로 사용할 경우
* `-f --filefirst` 생성되는 export 파일내용에서 파일이름을 먼저 export 할지 디렉터리 이름을 먼저 export 할지 결정합니다. 옵션을 생략하면 `false`, 전달하면 `true` 입니다.
* `-n --addnewline` 파일 마지막에 줄바꿈 문자를 추가할지 말지를 결정합니다. 옵션을 생략하면 `true`, 전달하면 `false` 입니다.
* `-s --usesemicolon` 줄 마지막에 `;` 문자를 추가할지 말지를 결정합니다. 옵션을 생략하면 `true`, 전달하면 `false` 입니다.
* `-t --usetimestamp` 파일 처음에 주석을 작성할 때 시간(YYYY-MM-DD HH:mm 형식)을 추가할지 말지를 결정합니다. 옵션을 생략하면 `false` 전달하면 `true` 입니다.
* `-e --excludes [comma separated exclude directories]` 제외할 디렉터리를 전달합니다. 기본 값은 `['@types', 'typings', '__test__', '__tests__']` 입니다. 사용자 설정 값을 전달하려고 하는 경우 아래 예제와 같이 쉼표로 구분해서 전달하세요.
* `-x --targetexts [comma separated extname]` export 구문을 생성할 때 사용할 확장자명을 전달합니다. 기본 값은 `['ts', 'tsx']` 입니다. 확장자명을 전달할 때는 예와같이 점 문자를 제외하고 전달해야합니다. 또한 사용자 설정 값을 전달하려고 하는 경우 아래 예제와 같이 쉼표로 구분해서 전달하세요.

# 사용법
## 라이브러리로 사용하는 경우
```
const option = {};

option.addNewline = option.addNewline || true;
option.useSemicolon = option.useSemicolon || true;
option.useTimestamp = option.useTimestamp || false;
option.globOptions.cwd = option.globOptions.cwd || process.cwd();
option.globOptions.nonull = option.globOptions.nonull || true;
option.globOptions.dot = option.globOptions.dot || true;
option.excludes = option.excludes || ['@types', 'typings', '__test__', '__tests__'];
option.targetExts = option.targetExts || ['ts', 'tsx'];

(async () => {
  await createTypeScriptIndex(option);
})();
```

## CLI
```
# 기본 사용법
cti ./src

# 줄바꿈 문자 포함하지 않기
cti -n ./src

# 제외할 디렉터리를 직접 전달하는 방법
cti -n -e @types,typings,__test__,__tests__,pages ./src
```

# Language
* [English](https://github.com/imjuni/create-ts-index/blob/master/README.md)
* [Korean](https://github.com/imjuni/create-ts-index/blob/master/README.ko.md)
