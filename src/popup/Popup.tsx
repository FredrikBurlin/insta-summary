import { useState, useEffect } from 'react'

import './Popup.css'

export const Popup = () => {
  const [count, setCount] = useState(0)
  const link = 'https://github.com/guocaoyi/create-chrome-ext'

  const minus = () => {
    if (count > 0) setCount(count - 1)
  }

  const add = () => setCount(count + 1)

  useEffect(() => {
    chrome.storage.sync.get(['count'], (result) => {
      setCount(result.count || 0)
    })
  }, [])

  useEffect(() => {
    chrome.storage.sync.set({ count })
    chrome.runtime.sendMessage({ type: 'COUNT', count })
  }, [count])

  const getArticles = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id!, { type: 'GET_ARTICLES' }, (response) => {
        console.log('Articles from page:', response.articles);
      });
    });
  };
  return (
    <main>
      <h3>Popup Page</h3>
      <button onClick={getArticles}>Get Articles</button>
    </main>
  )
}

export default Popup
