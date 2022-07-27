import fetch from "node-fetch"

export const getToken = async (clientId, clientSecret) => {
  const params = {
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  }

  const formBody = []
  for (const property in params) {
    const encodedKey = encodeURIComponent(property)
    const encodedValue = encodeURIComponent(params[property])
    formBody.push(encodedKey + "=" + encodedValue)
  }
  const body = formBody.join("&")

  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body,
  })

  const { access_token: token } = await response.json()
  return token
}
