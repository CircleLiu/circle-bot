import { Context, segment } from "koishi"
import { TweetV2SingleResult, TwitterApi } from "twitter-api-v2"
import { HttpsProxyAgent } from 'https-proxy-agent'

const twitterUrlPattern = /^(?:https:\/\/)?twitter.com\/.+\/status\/([0-9]+).*$/m
const shortUrlPattern = /(?:https:\/\/)?t.co\/.+$/m

export interface Config {
  bearerToken: string
}

export function apply(ctx: Context, { bearerToken }: Config) {

  const httpAgent = new HttpsProxyAgent(ctx.app.http.config.proxyAgent)
  const twitterClient = new TwitterApi(bearerToken, {
    httpAgent,
  })

  async function getTweet(id: string) {
    const tweet = await twitterClient.v2.singleTweet(id, {
      expansions: ['attachments.media_keys', 'author_id'],
      'media.fields': ['url'],
      'user.fields': ['name', 'username'],
    })
    return tweet
  }

 async function buildTweetMessage(tweet: TweetV2SingleResult) {
   const messages = []
   const shortLink = tweet.data.text.match(shortUrlPattern)[0]
   messages.push(shortLink)
   messages.push(`Author: ${tweet.includes?.users[0]?.name} @${tweet.includes?.users[0]?.username}`)
   messages.push('-'.repeat(messages[1].length))
   messages.push(tweet.data.text.replace(shortLink, ''))
   tweet.includes?.media?.forEach((media) => {
     if (media.type === 'photo') {
       messages.push(segment.image(media.url))
     }
   })

   return messages.join('\n')
 }
  
  ctx.middleware(async (session, next) => {
    const message = session.content.trim()
    const capture = message.match(twitterUrlPattern)
    if (capture) {
      const tweet = await getTweet(capture[1])
      return await buildTweetMessage(tweet)
    } else {
      return next()
    }
  })
}
