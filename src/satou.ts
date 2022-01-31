import { Context } from 'koishi'

export function apply(ctx: Context) {
  
  ctx.middleware(async (session, next) => {
    const message = session.content.trim()
    if (message === '砂糖爱我吗') {
      return session.userId === '1016607834' ? '爱你' : 'bka'
    } else {
      return next()
    }
  })
}