export interface TypedBase {
  [route: string]: any
}

export interface TypedRoute {
  params: any
  query: any
  body: any
  response: any
}

// Here for reference. It's not recommended to extend your API
// definition from IndexedBase, because then your definition will
// not cause errors when an invalid route is defined or called
export interface TypedIndexedBase {
  // e.g. '/orders'
  [route: string]: {
    // 'get' | 'post' | 'put' | 'patch' | 'head' | 'delete' | 'options'
    [method: string]: TypedRoute
  }
}
