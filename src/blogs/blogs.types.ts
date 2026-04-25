import {ObjectId} from "mongodb";

export type BlogInput = {
  name: string
  description: string
  websiteUrl: string
}

export type BlogDb = {
  _id?: ObjectId
  name: string
  description: string
  websiteUrl: string
  createdAt: Date
  isMembership: boolean
}

export type BlogView = {
  id: string
  name: string
  description: string
  websiteUrl: string
  createdAt: string
  isMembership: boolean
}
