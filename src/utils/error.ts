export class InvalidKernelSizeError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'InvalidKernelSizeError';
    }
  }

export class InvalidColorSpaceError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'InvalidColorSpaceError';
    }
  }

export class UnsupportedImageFormatError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'UnsupportedImageFormatError';
    }
  }
  