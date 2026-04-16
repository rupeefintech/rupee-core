// middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { JwtPayload } from "jsonwebtoken"

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"] // Bearer <token>
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) return res.status(401).json({ message: "No token provided" })

  try {
    const decoded = jwt.verify(token, "secretkey") // use same secret as login
    req.user = decoded // attach decoded info to request
    next()
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" })
  }
}
declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload // depends on what you store in JWT
    }
  }
}