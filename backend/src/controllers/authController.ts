// controllers/authController.ts
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

async function test() {
  const admins = await prisma.admin.findMany()
  console.log(admins)
}

test()

export const login = async (req, res) => {
  const { email, password } = req.body

  try {
    const admin = await prisma.admin.findUnique({
      where: { email }
    })

    if (!admin) {
      return res.status(401).json({ message: "Invalid email" })
    }

    const isMatch = await bcrypt.compare(password, admin.password)

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" })
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      "secretkey",
      { expiresIn: "1d" }
    )

    res.json({ token })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}