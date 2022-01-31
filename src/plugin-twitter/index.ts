import { Context } from "koishi"
import { TweetV2SingleResult, TwitterApi } from "twitter-api-v2"
import { HttpsProxyAgent } from 'https-proxy-agent'
import axios from "axios"

const twitterUrlPattern = /^(?:https:\/\/)?twitter.com\/.+\/status\/([0-9]+).*$/m
const shortUrlPattern = /(?:https:\/\/)?t.co\/.+$/m

export interface Config {
  bearerToken: string
  proxy?: string
}

export function apply(ctx: Context, { bearerToken, proxy }: Config) {

  const httpAgent = new HttpsProxyAgent(proxy)
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
       messages.push(getImageToBase64(media.url))
     }
   })
   const res = await Promise.all(messages)
   return res.join('\n')
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

  async function getImageToBase64(url) {
    const { data } = await axios.get(url, {
      proxy: false,
      httpsAgent: httpAgent,
      responseType: 'arraybuffer',
    })
    const base64img = Buffer.from(data).toString('base64')
    return `[CQ:image,file=base64://${base64img}]`
  }
}
