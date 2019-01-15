create-ts-index
----

# 설치
```
npm install create-ts-index --save-dev
```

# 변경점
`1.5` 버전에서는 큰 변경점이 있습니다. commander.js에서 Git-style sub-commands를 채용하였습니다. 그래서 1.5 버전은 더 이상 예전 방식으로 사용할 수 없습니다. 이렇게 변경된 가장 큰 이유는, 기존 기능을 지원하면서 entrypoint를 자동생성하기 위해서 입니다. 기존과 같이 index.ts를 생성하려고 하는 사람은 `create` sub-commands를 사용하면 됩니다. 새로운 기능인 `entrypoint` sub-commands를 사용하면 webpack과 같은 build 도구에서 사용할 수 있는 entrypoint를 얻게 됩니다.

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

create-ts-index create sub-command는 아래와 같이 export index.ts 파일을 생성합니다.

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

만약 create-ts-index entrypoint sub-command를 사용하면 아래와 같이 동작합니다.

```
  src/
    app.ts
    component/
      Nav.ts
      Button.ts
  > index.ts
    // created from 'create-ts-index'
    export * from './src/app.ts'
    export * from './src/component/Nav.ts'
    export * from './src/component/Button.ts'
```

index.ts 파일을 webpack entrypoint로 사용할 수 있습니다.

# 옵션
## 라이브러리로 사용할 경우
* `fileFirst?: boolean` 생성되는 export 파일내용에서 파일이름을 먼저 export 할지 디렉터리 이름을 먼저 export 할지 결정합니다. 기본 값은 `false` 입니다.
* `addNewline?: boolean` 파일 마지막에 줄바꿈 문자를 추가할지 말지를 결정합니다. 기본 값은 `true` 입니다.
* `useSemicolon?: boolean` 줄 마지막에 `;` 문자를 추가할지 말지를 결정합니다. 기본 값은 `true` 입니다.
* `useTimestamp?: boolean` 파일 처음에 주석을 작성할 때 시간(YYYY-MM-DD HH:mm 형식)을 추가할지 말지를 결정합니다. 기본 값은 `false` 입니다.
* `includeCWD?: boolean` 작업디렉터리로 전달된 cwd에 대해서 index.ts 파일을 생성할 것인지에 대해서 결정합니다. 기본 값은 `true` 입니다.
* `excludes?: string[]` 제외할 디렉터리를 전달합니다. 기본 값은 `['@types', 'typings', '__test__', '__tests__']` 입니다.
* `fileExcludePatterns?: string[]` 제외할 파일이름 패턴을 전달합니다. 기본 값은 `[]` 입니다. 전달된 패턴은 indexOf 함수를 사용하여 파일이름에서 검색되며 indexOf 함수 결과가 0 이상인 경우 제외됩니다.
* `targetExts?: string[]` export 구문을 생성할 때 사용할 확장자명을 전달합니다. 기본 값은 `['ts', 'tsx']` 입니다. 확장자명을 전달할 때는 예와같이 점 문자를 제외하고 전달해야합니다.
* `globOptions?: glob.IOptions` [node-glob](https://github.com/isaacs/node-glob) 옵션 값을 전달할 수 있습니다. 자세한 내용은 링크문서를 참고하세요.

## CLI(command-line interface)로 사용할 경우
* `-f --filefirst` 생성되는 export 파일내용에서 파일이름을 먼저 export 할지 디렉터리 이름을 먼저 export 할지 결정합니다. 옵션을 생략하면 `false`, 전달하면 `true` 입니다.
* `-n --addnewline` 파일 마지막에 줄바꿈 문자를 추가할지 말지를 결정합니다. 옵션을 생략하면 `true`, 전달하면 `false` 입니다.
* `-s --usesemicolon` 줄 마지막에 `;` 문자를 추가할지 말지를 결정합니다. 옵션을 생략하면 `true`, 전달하면 `false` 입니다.
* `-t --usetimestamp` 파일 처음에 주석을 작성할 때 시간(YYYY-MM-DD HH:mm 형식)을 추가할지 말지를 결정합니다. 옵션을 생략하면 `false` 전달하면 `true` 입니다.
* `-c --includecwd` 작업디렉터리로 전달된 cwd에 대해서 index.ts 파일을 생성할 것인지에 대해서 결정합니다. 옵션을 생략하면 `true` 전달하면 `false` 입니다.
* `-e --excludes [comma separated exclude directories]` 제외할 디렉터리를 전달합니다. 기본 값은 `['@types', 'typings', '__test__', '__tests__']` 입니다. 사용자 설정 값을 전달하려고 하는 경우 아래 예제와 같이 쉼표로 구분해서 전달하세요.
* `-i --fileexcludes [comma separated extname]` 제외할 파일이름 패턴을 전달합니다.기본 값은 `[]` 입니다. 사용자 설정 값을 전달하려고 하는 경우 쉼표로 구분해서 전달하세요.
* `-x --targetexts [comma separated extname]` export 구문을 생성할 때 사용할 확장자명을 전달합니다. 기본 값은 `['ts', 'tsx']` 입니다. 확장자명을 전달할 때는 예와같이 점 문자를 제외하고 전달해야합니다. 또한 사용자 설정 값을 전달하려고 하는 경우 아래 예제와 같이 쉼표로 구분해서 전달하세요.

# 사용법
## 라이브러리로 사용하는 경우
```
const option = {};

option.fileFirst = false;
option.addNewline = true;
option.useSemicolon = true;
option.useTimestamp = false;
option.fileExcludePatterns = [];
option.globOptions.cwd = process.cwd();
option.globOptions.nonull = true;
option.globOptions.dot = true;
option.excludes = ['@types', 'typings', '__test__', '__tests__'];
option.targetExts = ['ts', 'tsx'];

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
