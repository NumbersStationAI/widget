import {
  useMutation as useMutationPrimitive,
  type UseMutationOptions,
  type UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query'
import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios'

// I have to re-export this type bc it is used by the autogenerated kubb code.
export type { UseMutationOptions } from '@tanstack/react-query'

// I don't want to manually mark which queries need to be invalidated on every
// mutation. While doing so improves performance slightly, we can typically just
// invalidate all the active queries to achieve the same behavior at negligible
// performance detriment. Invalidating all active queries is much simpler. This
// mimics the Remix `action` and `loader` paradigm.
export function useMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>,
): UseMutationResult<TData, TError, TVariables, TContext> {
  const queryClient = useQueryClient()
  return useMutationPrimitive({
    onSettled: () => queryClient.invalidateQueries(),
    ...options,
  })
}

export type RequestConfig<TData = unknown> = {
  baseURL?: string
  url?: string
  method: 'GET' | 'PUT' | 'PATCH' | 'POST' | 'DELETE' | 'OPTIONS'
  params?: unknown
  data?: TData | FormData
  responseType?:
    | 'arraybuffer'
    | 'blob'
    | 'document'
    | 'json'
    | 'text'
    | 'stream'
  signal?: AbortSignal
  headers?: AxiosRequestConfig['headers']
  withCredentials?: boolean
}

export type Env = { API_URL: string }

declare global {
  interface Window {
    env: Env
  }
}

export type ResponseConfig<TData = unknown> = {
  data: TData
  status: number
  statusText: string
  headers?: AxiosResponse['headers']
}

const axiosInstance = axios.create({
  paramsSerializer: {
    indexes: null,
    encode: (param: string) => param,
  },
})
const axiosClient = async <TData, TError = unknown, TVariables = unknown>(
  config: RequestConfig<TVariables>,
): Promise<ResponseConfig<TData>> => {
  return axiosInstance
    .request<TData, ResponseConfig<TData>>({
      baseURL: window.env.API_URL,
      withCredentials: true,
      ...config,
    })
    .catch((error: AxiosError<TError>) => {
      throw error
    })
}

export default axiosClient
