type Greeting = {
  greeting: string
}

export interface API {
  '/hello': {
    get: {
      response: Greeting
    }
    post: {
      body: {
        name?: string
      }
      response: Greeting
    }
  }
  '/hello/:name': {
    post: {
      params: {
        name: string
      }
      response: Greeting
    }
  }
}
