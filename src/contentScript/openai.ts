export async function getChatGPTSummary(posts: any) {
  const storage = await chrome.storage.sync.get(['apiKey'])
  const apiKey = storage.apiKey
  const apiUrl = 'https://api.openai.com/v1/chat/completions' // Make sure the URL is correct for the OpenAI API
  console.log(JSON.stringify(posts, null, 2))
  const body = {
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a summariser.',
      },
      {
        role: 'user',
        content: `Here are the posts from instagram:\n${JSON.stringify(posts, null, 2)}\n
        Summarize the posts as a easy-to-read text maximum 500 chars in html.
        Style the html. Make names more readable.
        Make sure to not include any markdown in the response.
        Add new lines for readabillity. The purpose is to let me know what the posts are about.
        Do not includes ads. Exclude likes, hashtags, and comment counts.
        Example
        <p><b>First User</b> The summmary</p>
        <p><b>second User</b> The summmary</p>
        ...`,
      },
    ],
    max_tokens: 300,
  }
/*
        Do not includes ads. Exclude hashtags likes and comment counts. Make names more readable. Use Donald Trump's language style.
*/
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    const completion = data.choices[0].message.content.trim()
    displayDialog(completion)
  } catch (error) {
    console.error('Error sending data to OpenAI:', error)
  }
}

function displayDialog(htmlString: string) {
  const dialog = document.createElement('div')
  dialog.style.position = 'fixed'
  dialog.style.top = '50%'
  dialog.style.left = '50%'
  dialog.style.transform = 'translate(-50%, -50%)'
  dialog.style.padding = '20px'
  dialog.style.backgroundColor = 'white'
  dialog.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)'
  dialog.style.zIndex = '1000'
  dialog.style.borderRadius = '8px'
  dialog.style.width = '500px'
  dialog.style.boxSizing = 'border-box'
  dialog.style.fontFamily = 'Helvetica, sans-serif'
  dialog.style.fontWeight = '100'
  dialog.style.fontSize = '21px'
  dialog.style.lineHeight = '1.6'

  const closeButton = document.createElement('button')
  closeButton.textContent = '×'
  closeButton.style.position = 'absolute'
  closeButton.style.top = '10px'
  closeButton.style.right = '10px'
  closeButton.style.background = 'transparent'
  closeButton.style.border = 'none'
  closeButton.style.fontSize = '24px'
  closeButton.style.cursor = 'pointer'
  closeButton.style.fontWeight = '100'
  closeButton.onclick = () => dialog.remove()
  dialog.appendChild(closeButton)

  const messageElement = document.createElement('div')
  messageElement.innerHTML = htmlString
  messageElement.style.margin = '20px 0 0 0'
  messageElement.style.textAlign = 'left'
  dialog.appendChild(messageElement)

  document.body.appendChild(dialog)
}
