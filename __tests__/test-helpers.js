"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.req = void 0;
const app_1 = require("../src/app");
const supertest_1 = require("supertest");
exports.req = (0, supertest_1.agent)(app_1.app);
