export const accpetedProtocols = ['http', 'https']
export const cookieOptions = {
  httpOnly: true,
  secure: true,
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21),
}
