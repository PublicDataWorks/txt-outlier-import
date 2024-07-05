import * as log from 'log'

// New comment or incoming SMS recalculates the lookup cache
// references: ["+123456789+1098766541"], while lookup backend expects "+123456789" (without the phone number of Outlier team)
const refreshLookupCache = async (conversationId: string, references: string[]) => {
  const ref = references[0].replace(Deno.env.get('OUTLIER_PHONE_NUMBER')!, '')
  const url = `${Deno.env.get('LOOKUP_URL')!}/conversations/${conversationId}?reference=${ref}`
  log.info(`Refreshing lookup cache for ${url}, references: ${references}`)

  try {
    const response = await fetch(url, {
      headers: {
        authorization: `Bearer ${Deno.env.get('LOOKUP_SECRET')!}`,
      },
    })
    log.info(`refreshLookupCache response status: ${response.status}`)
  } catch (error) {
    log.error(`refreshLookupCache error: ${error}`)
  }
}

export { refreshLookupCache }
