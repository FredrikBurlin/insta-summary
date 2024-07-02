import { useState, useEffect } from 'react'
import './Popup.css'

export const Popup = () => {
  const [count, setCount] = useState(0)
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    chrome.storage.sync.get(['count'], (result) => {
      setCount(result.count || 0)
    })
  }, [])

  useEffect(() => {
    chrome.storage.sync.set({ count })
    chrome.runtime.sendMessage({ type: 'COUNT', count })
  }, [count])

  const getSummary = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id!, { type: 'GET_SUMMARY' }, (response) => {
        console.log('Sent from page:', response);
        setSummary(response.summary)
      });
    });
  }


  return (
    <main>
      <button onClick={getSummary}>Summarise</button>
      {summary && (
        <div className="summary">
          <h4>Summary</h4>
          <pre>{JSON.stringify(summary, null, 2)}</pre>
        </div>
      )}
    </main>
  )
}

export default Popup
