import * as log from 'log'

const CREATE_MESSAGE_URL = 'https://public.missiveapp.com/v1/messages/'

const getMissiveMessage = async (id: string, secretKey: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${secretKey}`,
  }
  const url = `${CREATE_MESSAGE_URL}${id}`
  const response = await fetch(url, { method: 'GET', headers: headers })
  if (response.ok) {
    return await response.json()
  } else {
    const errorMessage = `Failed to get Missive message. Message id: ${id}}, Missive's respond = ${
      JSON.stringify(await response.json())
    }`
    log.error(errorMessage)
  }
}

export { getMissiveMessage }
