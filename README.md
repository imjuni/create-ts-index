create-ts-index
----

# Introduction
create-ts-index is create general export file. For example,

* src/
  * app.ts
  * component/
    * Nav.ts
    * Button.ts

create-ts-index create index.ts file below,

* src/
  * app.ts
  * > index.ts
    export * from './component';
    export * from './app';
  * component/
    * Nav.ts
    * Button.ts
    * > index.ts
      export * from './Nav';
      export * from './Button';

# Option
*
