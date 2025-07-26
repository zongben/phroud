# Getting Started

Start by installing `empack` and `reflect-metadata`

```sh
npm install empack@latest reflect-metadata
```

Then make sure you have `experimentalDecorators` and `emitDecoratorMetadata` set to true in your `tsconfig.json`

```json
"compilerOptions": {
    //...other configs
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
}
```
