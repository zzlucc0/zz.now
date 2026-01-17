import { hash, verify } from 'argon2'

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, {
    type: 2, // Argon2id
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  })
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await verify(hash, password)
  } catch (error) {
    return false
  }
}
