import axios, {
  Axios,
  AxiosInstance,
  AxiosStatic,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios'

import { TypedBase, TypedIndexedBase, TypedRoute } from './base'

type Modify<T, R> = Omit<T, keyof R> & R

export interface TypedAxiosRequestConfig<
  API extends TypedIndexedBase,
  Path extends Extract<keyof API, string>,
  Method extends keyof API[Path],
  RouteDef extends TypedRoute = API[Path][Method],
> extends AxiosRequestConfig<RouteDef['body']> {
  url?: Path
  method?: Extract<Method, string>
  params?: RouteDef['query']
  query?: RouteDef['query']
}

export interface TypedAxiosResponse<
  API extends TypedIndexedBase,
  Path extends Extract<keyof API, string>,
  Method extends keyof API[Path],
  RouteDef extends TypedRoute = API[Path][Method],
> extends AxiosResponse<RouteDef['response'], RouteDef['body']> {}

interface TypedAxios<API extends TypedBase>
  extends Modify<
    typeof Axios,
    {
      request<
        Path extends Extract<keyof API, string>,
        Method extends keyof API[Path] = 'get',
      >(
        config: TypedAxiosRequestConfig<API, Path, Method>,
      ): Promise<TypedAxiosResponse<API, Path, Method>>

      get<Path extends Extract<keyof API, string>>(
        url: Path | string,
        config?: TypedAxiosRequestConfig<API, Path, 'get'>,
      ): Promise<TypedAxiosResponse<API, Path, 'get'>>

      delete<Path extends Extract<keyof API, string>>(
        url: Path | string,
        config?: TypedAxiosRequestConfig<API, Path, 'delete'>,
      ): Promise<TypedAxiosResponse<API, Path, 'delete'>>

      head<Path extends Extract<keyof API, string>>(
        url: Path | string,
        config?: TypedAxiosRequestConfig<API, Path, 'head'>,
      ): Promise<TypedAxiosResponse<API, Path, 'head'>>

      post<Path extends Extract<keyof API, string>>(
        url: Path | string,
        data?: API[Path]['post']['body'],
        config?: TypedAxiosRequestConfig<API, Path, 'post'>,
      ): Promise<TypedAxiosResponse<API, Path, 'post'>>

      postForm<Path extends Extract<keyof API, string>>(
        url: Path | string,
        data?: API[Path]['post']['body'],
        config?: TypedAxiosRequestConfig<API, Path, 'post'>,
      ): Promise<TypedAxiosResponse<API, Path, 'post'>>

      put<Path extends Extract<keyof API, string>>(
        url: Path | string,
        data?: API[Path]['put']['body'],
        config?: TypedAxiosRequestConfig<API, Path, 'put'>,
      ): Promise<TypedAxiosResponse<API, Path, 'put'>>

      putForm<Path extends Extract<keyof API, string>>(
        url: Path | string,
        data?: API[Path]['put']['body'],
        config?: TypedAxiosRequestConfig<API, Path, 'put'>,
      ): Promise<TypedAxiosResponse<API, Path, 'put'>>

      patch<Path extends Extract<keyof API, string>>(
        url: Path | string,
        data?: API[Path]['patch']['body'],
        config?: TypedAxiosRequestConfig<API, Path, 'patch'>,
      ): Promise<TypedAxiosResponse<API, Path, 'patch'>>

      patchForm<Path extends Extract<keyof API, string>>(
        url: Path | string,
        data?: API[Path]['patch']['body'],
        config?: TypedAxiosRequestConfig<API, Path, 'patch'>,
      ): Promise<TypedAxiosResponse<API, Path, 'patch'>>
    }
  > {}

export interface TypedAxiosInstance<API extends TypedBase = any>
  extends Modify<AxiosInstance, TypedAxios<API>> {
  <
    Path extends Extract<keyof API, string>,
    Method extends keyof API[Path] = 'get',
  >(
    config: TypedAxiosRequestConfig<API, Path, Method>,
  ): Promise<TypedAxiosResponse<API, Path, Method>>

  <Path extends Extract<keyof API, string>, Method extends keyof API[Path]>(
    url: Path | string,
    config?: TypedAxiosRequestConfig<API, Path, Method>,
  ): Promise<TypedAxiosResponse<API, Path, Method>>
}

export interface TypedAxiosStatic<API extends TypedBase = any>
  extends Modify<
    Modify<AxiosStatic, TypedAxiosInstance<API>>,
    {
      create<T extends API>(config?: AxiosRequestConfig): TypedAxiosInstance<T>
      Axios: TypedAxios<API>
    }
  > {}

const matchPathParams = /\/:([a-zA-Z-]*)/g

function replaceParams(
  url: string,
  params: Record<string, string>,
): [string, Record<string, string>] {
  let newUrl = url
  let newParams = params
  const matches = url.matchAll(matchPathParams)
  for (const match of matches) {
    if (!newParams?.[match[1]]) {
      throw new Error(`Missing path parameters: ${match[1]}`)
    }
    newUrl = newUrl.replace(
      match[0],
      `/${encodeURIComponent(newParams?.[match[1]])}`,
    )
    delete newParams?.[match[1]]
  }

  return [newUrl, newParams]
}

function passParamsUrlConfig(originalFn: Function) {
  return (url: string, config?: any): Promise<any> => {
    let replacedUrl = url

    if (config?.params) {
      ;[replacedUrl, config.params] = replaceParams(url, config.params)
    }

    if (config?.query) {
      replacedUrl = `${replacedUrl}?${Object.entries(config.query)
        .map(([key, value]) => `${key}=${value}`)
        .join('&')}`
    }

    return originalFn(replacedUrl, config)
  }
}

function passParamsUrlDataConfig(originalFn: Function) {
  return (url: string, data?: any, config?: any): Promise<any> => {
    let replacedUrl = url

    if (config?.params) {
      ;[replacedUrl, config.params] = replaceParams(url, config.params)
    }

    if (config?.query) {
      replacedUrl = `${replacedUrl}?${Object.entries(config.query)
        .map(([key, value]) => `${key}=${value}`)
        .join('&')}`
    }

    return originalFn(replacedUrl, data, config)
  }
}

function passParamsConfig(originalFn: Function) {
  return (config: any): Promise<any> => {
    if (config?.params) {
      ;[config.url, config.params] = replaceParams(config.url, config.params)
    }

    if (config?.query) {
      config.url = `${config.url}?${Object.entries(config.query)
        .map(([key, value]) => `${key}=${value}`)
        .join('&')}`
    }

    return originalFn(config)
  }
}

const modifiedAxios = {
  ...axios,
  create: (config?: any) => {
    const instance = axios.create(config)
    instance.request = passParamsConfig(instance.request)
    instance.get = passParamsUrlConfig(instance.get)
    instance.delete = passParamsUrlConfig(instance.delete)
    instance.head = passParamsUrlConfig(instance.head)
    instance.post = passParamsUrlDataConfig(instance.post)
    instance.postForm = passParamsUrlDataConfig(instance.postForm)
    instance.put = passParamsUrlDataConfig(instance.put)
    instance.putForm = passParamsUrlDataConfig(instance.putForm)
    instance.patch = passParamsUrlDataConfig(instance.patch)
    instance.patchForm = passParamsUrlDataConfig(instance.patchForm)
    return instance
  },
  request: passParamsConfig(axios.request),
  get: passParamsUrlConfig(axios.get),
  delete: passParamsUrlConfig(axios.delete),
  head: passParamsUrlConfig(axios.head),
  post: passParamsUrlDataConfig(axios.post),
  postForm: passParamsUrlDataConfig(axios.postForm),
  put: passParamsUrlDataConfig(axios.put),
  putForm: passParamsUrlDataConfig(axios.putForm),
  patch: passParamsUrlDataConfig(axios.patch),
  patchForm: passParamsUrlDataConfig(axios.patchForm),
}

export const client: TypedAxiosStatic = modifiedAxios as any
