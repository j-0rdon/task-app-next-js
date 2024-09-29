declare module 'class-variance-authority' {
  export function cva(...args: any[]): any;
  export type VariantProps<T extends (...args: any) => any> = any;
}