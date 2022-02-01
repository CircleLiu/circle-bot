import { Context } from 'koishi'
import { sample } from 'lodash'

export function apply(ctx: Context) {

  const yesList = ['爱你', '爱你❤️', '❤️❤️❤️❤️❤️']
  const noList = ['艹', 'bka']
  
  ctx.middleware(async (session, next) => {
    const message = session.content.trim()
    if (message === '砂糖爱我吗') {
      return session.userId === '1016607834' ? sample(yesList) : sample(noList)
    } else {
      return next()
    }
  })
}