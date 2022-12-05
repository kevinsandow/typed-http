import { client } from '..'
import { API } from './api'

const apiClient = client.create<API>({
  baseURL: `http://localhost:8080`,
})

async function main() {
  const get = await apiClient.get('/hello')
  console.log(get.data.greeting)

  const postWithoutBody = await apiClient.post('/hello')
  console.log(postWithoutBody.data.greeting)

  const postWithBody = await apiClient.post('/hello', { name: 'brave new World' })
  console.log(postWithBody.data.greeting)

  const postWithParams = await apiClient.post('/hello/:name', {}, { params: { name: 'brave new World' } })
  console.log(postWithParams.data.greeting)
}

main().catch(console.error)
