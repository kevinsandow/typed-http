import express from 'express'
import bodyParser from 'body-parser'

import { server } from '..'
import { API } from './api'

const app = express()
app.disable('x-powered-by')
app.use(bodyParser.json())

const router = server<API>(app)

router.get('/hello', (req, res) => {
  res.send({
    greeting: 'Hello World!'
  })
})

router.post('/hello', (req, res) => {
  res.send({
    greeting: `Hello ${req.body?.name ?? 'World'}!`
  })
})

router.post('/hello/:name', (req, res) => {
  res.send({
    greeting: `Hello ${req.params.name}!`
  })
})

app.use(router)

app.listen('8080', () => {
  console.log(`Listening`)
})
