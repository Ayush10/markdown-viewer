/// <reference types="vite/client" />

declare module 'gray-matter' {
  interface GrayMatterFile<T> {
    content: string;
    data: T;
    excerpt?: string;
    orig: string;
  }

  function matter<T = Record<string, unknown>>(
    input: string,
    options?: Record<string, unknown>
  ): GrayMatterFile<T>;

  export default matter;
}
