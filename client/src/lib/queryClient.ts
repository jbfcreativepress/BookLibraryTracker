import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * Enhanced error handling function to process API responses
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      // Try to parse error as JSON first
      const errorData = await res.json();
      throw new Error(errorData.message || `${res.status}: ${res.statusText}`);
    } catch (e) {
      // If JSON parsing fails, use text content
      const text = (await res.text().catch(() => res.statusText)) || res.statusText;
      throw new Error(`${res.status}: ${text}`);
    }
  }
}

/**
 * Make an API request with error handling and timeout
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  timeoutMs: number = 45000, // Increased default timeout to 45 seconds
): Promise<Response> {
  // Create an AbortController with the specified timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    // Add retry logic for network-related errors
    const maxRetries = 2;
    let currentRetry = 0;
    let lastError;

    while (currentRetry <= maxRetries) {
      try {
        const res = await fetch(url, {
          method,
          headers: data ? { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          } : { "Accept": "application/json" },
          body: data ? JSON.stringify(data) : undefined,
          credentials: "include",
          signal: controller.signal,
        });
        
        // Only throw for non-network errors (we'll retry network errors)
        if (res.ok || (res.status >= 400 && res.status < 500)) {
          if (!res.ok) {
            await throwIfResNotOk(res);
          }
          return res;
        } else if (res.status >= 500) {
          // For server errors, increment retry counter
          const errorMessage = await res.text().catch(() => res.statusText);
          throw new Error(`Server error (${res.status}): ${errorMessage}`);
        }
      } catch (error) {
        lastError = error;
        
        // Only retry on network errors or timeouts (AbortError)
        if (
          error instanceof TypeError || // Network error
          (error instanceof DOMException && error.name === 'AbortError') || // Timeout
          (error instanceof Error && error.message.includes('Server error')) // 5xx errors
        ) {
          currentRetry++;
          if (currentRetry <= maxRetries) {
            console.log(`Retrying API request (attempt ${currentRetry} of ${maxRetries})...`);
            // Exponential backoff: wait longer between retries (500ms, 1500ms)
            await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(3, currentRetry - 1)));
            continue;
          }
        }
        
        // Don't retry on other types of errors or if max retries reached
        throw error;
      }
    }
    
    // If we get here, all retries failed
    throw lastError || new Error(`Request failed after ${maxRetries} retries`);
  } finally {
    clearTimeout(timeoutId);
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Custom query function factory for React Query
 */
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      // Use our apiRequest function for consistent error handling and retries
      const response = await apiRequest("GET", queryKey[0] as string);
      
      if (unauthorizedBehavior === "returnNull" && response.status === 401) {
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Query error for ${queryKey[0]}:`, error);
      throw error;
    }
  };

/**
 * Configure React Query client with improved defaults
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: 1, // Allow 1 retry for queries by default
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
    mutations: {
      retry: 1, // Allow 1 retry for mutations as well
    },
  },
});
