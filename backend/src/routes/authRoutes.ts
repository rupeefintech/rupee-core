// routes/authRoutes.ts
import express from "express"
import { login } from "../controllers/authController"

const router = express.Router()


router.post("/login", login)
console.log("Auth routes loaded")
export default router