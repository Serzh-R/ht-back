import { req } from './helpers/test-helpers'

describe('/', () => {
   it('Should check base endpoint', async () => {
      const res = await req.get('/').expect(200)

      expect(res.body).toBe('Ciao Back-end!')

      console.log(res.status)
      console.log(res.body)
   })
})
