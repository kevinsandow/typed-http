import {
  Express,
  IRouterMatcher,
  NextFunction,
  Request,
  Response,
  Router,
} from 'express'

import { TypedBase, TypedRoute } from './base'

export interface TypedRequest<T extends TypedRoute> extends Request {
  body: T['body']
  params: T['params']
  query: T['query']
}

type Handler = (req: Request, res: Response, next: NextFunction) => void

type HandlerOrArray = Handler | Handler[]

type TypedHandler<T extends TypedRoute, R> = (
  req: TypedRequest<T>,
  res: Response<R>,
  next: NextFunction,
) => void

type HTTPMethod =
  | 'get'
  | 'post'
  | 'put'
  | 'patch'
  | 'head'
  | 'delete'
  | 'options'

export function server<APIDef extends TypedBase>(app: Express | Router) {
  const createAsyncRoute = function <
    Path extends keyof APIDef,
    Method extends HTTPMethod,
  >(
    path: Path,
    method: Method,
    handler: TypedHandler<
      APIDef[Path][Method],
      APIDef[Path][Method]['response']
    >,
    middlewares: HandlerOrArray[],
  ) {
    const handlers: Handler[] = []
    middlewares.forEach((m) =>
      Array.isArray(m) ? handlers.push(...m) : handlers.push(m),
    )
    handlers.push(handler)

    const route: IRouterMatcher<void> = app[method].bind(app)
    route(path as string, handlers)
  }

  function router(req: Request, res: Response, next: NextFunction) {
    app(req, res, next)
  }

  router.use = app.use.bind(app)
  router.route = createAsyncRoute

  router.get = function <Path extends keyof APIDef>(
    path: Path,
    handler: TypedHandler<APIDef[Path]['get'], APIDef[Path]['get']['response']>,
    ...middlewares: HandlerOrArray[]
  ) {
    return createAsyncRoute(path, 'get', handler, middlewares)
  }

  router.post = function <Path extends keyof APIDef>(
    path: Path,
    handler: TypedHandler<
      APIDef[Path]['post'],
      APIDef[Path]['post']['response']
    >,
    ...middlewares: HandlerOrArray[]
  ) {
    return createAsyncRoute(path, 'post', handler, middlewares)
  }

  router.put = function <Path extends keyof APIDef>(
    path: Path,
    handler: TypedHandler<APIDef[Path]['put'], APIDef[Path]['put']['response']>,
    ...middlewares: HandlerOrArray[]
  ) {
    return createAsyncRoute(path, 'put', handler, middlewares)
  }

  router.delete = function <Path extends keyof APIDef>(
    path: Path,
    handler: TypedHandler<
      APIDef[Path]['delete'],
      APIDef[Path]['delete']['response']
    >,
    ...middlewares: HandlerOrArray[]
  ) {
    return createAsyncRoute(path, 'delete', handler, middlewares)
  }

  router.patch = function <Path extends keyof APIDef>(
    path: Path,
    handler: TypedHandler<
      APIDef[Path]['patch'],
      APIDef[Path]['patch']['response']
    >,
    ...middlewares: HandlerOrArray[]
  ) {
    return createAsyncRoute(path, 'patch', handler, middlewares)
  }

  router.options = function <Path extends keyof APIDef>(
    path: Path,
    handler: TypedHandler<
      APIDef[Path]['options'],
      APIDef[Path]['options']['response']
    >,
    ...middlewares: HandlerOrArray[]
  ) {
    return createAsyncRoute(path, 'options', handler, middlewares)
  }

  router.head = function <Path extends keyof APIDef>(
    path: Path,
    handler: TypedHandler<
      APIDef[Path]['head'],
      APIDef[Path]['head']['response']
    >,
    ...middlewares: HandlerOrArray[]
  ) {
    return createAsyncRoute(path, 'head', handler, middlewares)
  }

  return router
}
