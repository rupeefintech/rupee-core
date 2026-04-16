// models/Admin.ts
import prisma from "../lib/prisma"

export const findAdminByEmail = async (email: string) => {
  const result = await prisma.admin.findUnique({
    where: { email }
  })
  return result
}