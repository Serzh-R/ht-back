import { Router, Request, Response } from 'express';

import { db } from '../db/db';
import { HTTP_STATUSES } from '../settings';

import type { BlogInput, BlogView } from './blogs.types';
import type { APIErrorResult } from '../types/errors.types';
import {blogFieldValidator} from "../validation/fieldValidator";
import {errorResponse} from "../validation/errorResponse";

export const blogsRouter = Router({});

export const blogsController = {

    getBlogs (req: Request, res: Response) {
        const blogs = db.blogs;
        res.status(HTTP_STATUSES.OK_200).json(blogs);
    },

    createBlog (
        req: Request<{}, {}, BlogInput>,
        res: Response<BlogView | APIErrorResult>,
    ) {

        const errorsMessages = blogFieldValidator(req.body);

        const { name, description, websiteUrl } = req.body;

        if (errorsMessages.length > 0) {
            res.status(HTTP_STATUSES.BAD_REQUEST_400).json(errorResponse(errorsMessages));
            return;
        }

        const newBlog: BlogView = {
            id: String(Date.now()),
            name: name.trim(),
            description: description.trim(),
            websiteUrl: websiteUrl.trim(),
        };

        db.blogs.push(newBlog);

        res.status(HTTP_STATUSES.CREATED_201).json(newBlog);
    },

    getBlogById (req: Request<{ id: string }>, res: Response<BlogView>) {
        const blog = db.blogs.find((b) => b.id === req.params.id);

        if (!blog) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return;
        }

        res.status(HTTP_STATUSES.OK_200).json(blog);
    },

    updateBlog (
        req: Request<{ id: string }, {}, BlogInput>,
        res: Response<APIErrorResult>,
    ) {
        const blog = db.blogs.find((b) => b.id === req.params.id);

        if (!blog) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return;
        }

        const errorsMessages = blogFieldValidator(req.body);

        if (errorsMessages.length > 0) {
            res.status(HTTP_STATUSES.BAD_REQUEST_400).json(errorResponse(errorsMessages));
            return;
        }

        const { name, description, websiteUrl } = req.body;

        blog.name = name.trim();
        blog.description = description.trim();
        blog.websiteUrl = websiteUrl.trim();

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    },

    deleteBlogById (req: Request<{ id: string }>, res: Response) {
        const blogIndex = db.blogs.findIndex((b) => b.id === req.params.id);

        if (blogIndex === -1) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return;
        }

        db.blogs.splice(blogIndex, 1);

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    }

}

blogsRouter.get('/', blogsController.getBlogs)
blogsRouter.post('/', blogsController.createBlog)
blogsRouter.get('/:id', blogsController.getBlogById)
blogsRouter.put('/:id', blogsController.updateBlog)
blogsRouter.delete('/:id', blogsController.deleteBlogById)

