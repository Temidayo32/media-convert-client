declare module 'wmf' {
    // Define the module structure as per its usage
    // Example: export function someFunction(param: SomeType): ReturnType;
    // Adjust as per the actual usage in js-wmf
    export function image_size(data: ArrayBuffer | Uint8Array | Buffer): [number, number];
    export function draw_canvas(data: ArrayBuffer | Uint8Array | Buffer, canvas: HTMLCanvasElement): void;
    // Add other functions or types as needed
  }
  