

// Simulate network latency (e.g., 500ms - 1500ms)
export const delay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

// A generic wrapper for mock API calls to enforce async/await patterns
export const mockApiCall = async <T>(operation: () => T, customDelay?: number): Promise<T> => {
  await delay(customDelay);
  try {
    const result = operation();
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
  }
};
