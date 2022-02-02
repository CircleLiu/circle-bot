import { Context } from 'koishi'
import { sample } from 'lodash'

export function apply(ctx: Context) {

  const yesList = ['爱你', '爱你❤️', '❤️❤️❤️❤️❤️❤️', '敲喜翻']
  const noList = ['艹', 'bka']
  
  ctx.middleware(async (session, next) => {
    const message = session.content.trim()
    if (message === '砂糖爱我吗') {
      return session.userId === '1016607834' ? sample(yesList) : sample(noList)
    } else if (message === '砂糖可爱吗') {
      return sample(['ka', '可爱', 'bka', '不可爱'])
    } else {
      return next()
    }
  })
}