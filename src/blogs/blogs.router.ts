import { Router } from 'express';
import {blogsController} from "./blogs.controller";

export const blogsRouter = Router({});


blogsRouter.get('/', blogsController.getBlogs)
blogsRouter.post('/', blogsController.createBlog)
blogsRouter.get('/:id', blogsController.getBlogById)
blogsRouter.put('/:id', blogsController.updateBlog)
blogsRouter.delete('/:id', blogsController.deleteBlogById)

