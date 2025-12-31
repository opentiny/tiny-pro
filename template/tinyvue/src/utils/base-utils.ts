import { CommonError } from '@/types/global';

/**
 * Determines whether a value conforms to the CommonError shape.
 *
 * @param error - The value to test for a CommonError-like object
 * @returns `true` if `error` is a non-null object that has a `message` property of type `string`, `false` otherwise.
 */
export function isCommonError(error: unknown): error is CommonError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default class BaseUtils {
  public static getErrorMessage(error: unknown): string {
    return this.convertToCommonError(error).message;
  }

  private static convertToCommonError(error: unknown): CommonError {
    if (isCommonError(error)) {
      return error;
    }
    try {
      return new Error(JSON.stringify(error));
    } catch (e) {
      return new Error(String(error));
    }
  }
}