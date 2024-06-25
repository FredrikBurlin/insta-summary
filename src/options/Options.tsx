import { useState, useEffect } from 'react'

import './Options.css'

export const Options = () => {
  const [countSync, setCountSync] = useState(0)
  const [apiKey, setApiKey] = useState<string>('')

  const link = 'https://github.com/guocaoyi/create-chrome-ext'

  useEffect(() => {
    chrome.storage.sync.get(['count'], (result) => {
      setCountSync(result.count || 0)
    })

    chrome.runtime.onMessage.addListener((request) => {
      if (request.type === 'COUNT') {
        setCountSync(request.count || 0)
      }
    })
  }, [])

  useEffect(() => {
    // Load the API key from storage when the component mounts
    chrome.storage.sync.get(['apiKey'], (result) => {
      if (result.apiKey) {
        setApiKey(result.apiKey)
      }
    })
  }, [])

  const saveApiKey = () => {
    // Save the API key to storage
    chrome.storage.sync.set({ apiKey }, () => {
      alert('API key saved!')
    })
  }

  return (
    <main>
      <h1>Extension Settings</h1>
      <div>
        <label>
          API Key:
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{ marginLeft: '10px', width: '300px' }}
          />
        </label>
      </div>
      <button onClick={saveApiKey} style={{ marginTop: '20px' }}>
        Save API Key
      </button>
    </main>
  )
}

export default Options
