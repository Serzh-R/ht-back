import { req } from './test-helpers'
import { setDB } from '../src/db/db'
import { SETTINGS } from '../src/settings'

describe('/blogs', () => {
    beforeEach(() => {
        setDB()
    })

    it('should return empty array', async () => {
        const res = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(200)

        expect(res.body).toEqual([])
    })

    it('should create blog with correct input data', async () => {
        const newBlog = {
            name: 'My blog',
            description: 'backend blog',
            websiteUrl: 'https://myblog.com',
        }

        const createResponse = await req
            .post(SETTINGS.PATH.BLOGS)
            .send(newBlog)
            .expect(201)

        expect(createResponse.body).toEqual({
            id: expect.any(String),
            name: newBlog.name,
            description: newBlog.description,
            websiteUrl: newBlog.websiteUrl,
        })

        const getResponse = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(200)

        expect(getResponse.body.length).toBe(1)
        expect(getResponse.body[0]).toEqual(createResponse.body)
    })

    it('should not create blog with incorrect input data', async () => {
        const invalidBlog = {
            name: '',
            description: '',
            websiteUrl: 'wrong-url',
        }

        const response = await req
            .post(SETTINGS.PATH.BLOGS)
            .send(invalidBlog)
            .expect(400)

        expect(response.body.errorsMessages.length).toBe(3)

        const getResponse = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(200)

        expect(getResponse.body).toEqual([])
    })

    it('should return blog by id', async () => {
        const createResponse = await req
            .post(SETTINGS.PATH.BLOGS)
            .send({
                name: 'Blog 1',
                description: 'description 1',
                websiteUrl: 'https://blog1.com',
            })
            .expect(201)

        const createdBlog = createResponse.body

        const getResponse = await req
            .get(`${SETTINGS.PATH.BLOGS}/${createdBlog.id}`)
            .expect(200)

        expect(getResponse.body).toEqual(createdBlog)
    })

    it('should return 404 for not existing blog', async () => {
        await req
            .get(`${SETTINGS.PATH.BLOGS}/not-existing-id`)
            .expect(404)
    })

    it('should update existing blog with correct input data', async () => {
        const createResponse = await req
            .post(SETTINGS.PATH.BLOGS)
            .send({
                name: 'Blog 1',
                description: 'description 1',
                websiteUrl: 'https://blog1.com',
            })
            .expect(201)

        const createdBlog = createResponse.body

        await req
            .put(`${SETTINGS.PATH.BLOGS}/${createdBlog.id}`)
            .send({
                name: 'Updated blog',
                description: 'updated description',
                websiteUrl: 'https://updatedblog.com',
            })
            .expect(204)

        const getResponse = await req
            .get(`${SETTINGS.PATH.BLOGS}/${createdBlog.id}`)
            .expect(200)

        expect(getResponse.body).toEqual({
            id: createdBlog.id,
            name: 'Updated blog',
            description: 'updated description',
            websiteUrl: 'https://updatedblog.com',
        })
    })

    it('should not update blog with incorrect input data', async () => {
        const createResponse = await req
            .post(SETTINGS.PATH.BLOGS)
            .send({
                name: 'Blog 1',
                description: 'description 1',
                websiteUrl: 'https://blog1.com',
            })
            .expect(201)

        const createdBlog = createResponse.body

        await req
            .put(`${SETTINGS.PATH.BLOGS}/${createdBlog.id}`)
            .send({
                name: '',
                description: '',
                websiteUrl: 'invalid-url',
            })
            .expect(400)

        const getResponse = await req
            .get(`${SETTINGS.PATH.BLOGS}/${createdBlog.id}`)
            .expect(200)

        expect(getResponse.body).toEqual(createdBlog)
    })

    it('should delete existing blog', async () => {
        const createResponse = await req
            .post(SETTINGS.PATH.BLOGS)
            .send({
                name: 'Blog 1',
                description: 'description 1',
                websiteUrl: 'https://blog1.com',
            })
            .expect(201)

        const createdBlog = createResponse.body

        await req
            .delete(`${SETTINGS.PATH.BLOGS}/${createdBlog.id}`)
            .expect(204)

        await req
            .get(`${SETTINGS.PATH.BLOGS}/${createdBlog.id}`)
            .expect(404)
    })

    it('should return 404 when deleting non-existing blog', async () => {
        await req
            .delete(`${SETTINGS.PATH.BLOGS}/not-existing-id`)
            .expect(404)
    })
})