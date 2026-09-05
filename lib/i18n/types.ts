import type { en } from "./locales/en";

/** 把字面量类型放宽成 string，但保留键的结构 ——
    这样别的语言可以写自己的文案，漏掉任何一个键仍然编译不过 */
type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };

export type Dict = Widen<typeof en>;
