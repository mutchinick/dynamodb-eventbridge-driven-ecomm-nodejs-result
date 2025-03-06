// For when we want the type  to be expanded
export type TypeUtilsPretty<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: TypeUtilsPretty<O[K]> }
    : never
  : T

// export type TypeUtilPrettySimple<T> = { [K in keyof T]: T[K] } & {}

// Do nothing wrapper that "fixes" prettier/vscode syntax highlighting issue
export type TypeUtilsWrapper<T> = T
