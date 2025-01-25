export type TypeUtilsPretty<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: TypeUtilsPretty<O[K]> }
    : never
  : T

// export type TypeUtilPrettySimple<T> = { [K in keyof T]: T[K] } & {}
