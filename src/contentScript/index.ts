import { getChatGPTSummary } from "./openai"
console.info('contentScript is running hi')

/// example of scrolling 10 times
let scrollCount = 0
const maxScrolls = 5
const scrollInterval = 2000 // 2 seconds
const uniqueItems = new Map<string, any>()

// Function to extract data from an article element
function extractData(article: HTMLElement) {
  const username = article.querySelector('a[href^="/"]')?.textContent ?? 'unknown'
  const description = article.querySelectorAll('span[dir="auto"]')
  const images = article.querySelectorAll('img[alt]') as NodeListOf<HTMLImageElement>;
  const time = article.querySelector('time')?.dateTime
  const inlineDiv = article.querySelector('div[style*="display: inline;"]')?.innerHTML ?? ''
  const textContent = article.querySelector('div[style*="display: inline;"]')?.textContent ?? ''

  const data = {
    who: username,
    time: time,
    text: textContent,
    //textHtml: inlineDiv,
    description: `${username}\n${description}`,
    //images: { all: images, profileSrc: images?.item(0)?.src, mainSrc: images?.item(1)?.src },
    //html: article.innerHTML,
  }

  // Create a unique identifier (you might want to use a more robust method)
  const uniqueId = username + time

  return { uniqueId, data }
}

function getArticles() {
  const articles = document.querySelectorAll('article')

  Array.from(articles).forEach((article) => {
    const { uniqueId, data } = extractData(article as HTMLElement)
    if (!uniqueItems.has(uniqueId)) {
      uniqueItems.set(uniqueId, data)
    }
  })

  console.log(Array.from(uniqueItems.values()))
}

export {}

// example of text extraction
async function clickMoreButtons() {
  const moreButtons = document.querySelectorAll('div[role="button"] span:not(.clicked-more)')
  for (const button of moreButtons) {
    if (button.textContent === 'more') {
      ;(button.parentElement as HTMLElement).click()
      button.classList.add('clicked-more')
      const onclickProperty = (button as any).onclick

      if (typeof onclickProperty === 'function') {
        // If it's a function, call it
        onclickProperty.call(button)
      } else {
        // If it's not a function, it might be a string of JavaScript code
        // In this case, we'll need to evaluate it in the context of the button
        const onclickString = button.getAttribute('onclick')
        if (onclickString) {
          ;(function () {
            eval(onclickString)
          }).call(button)
        }
      }
      // Wait a bit for content to load
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }
}

async function scrollToBottom() {
  window.scrollTo(0, document.body.scrollHeight)
  scrollCount++

  // Click "more" buttons
  await clickMoreButtons()

  if (
    document.body.innerText.includes('seen all new posts') ||
    document.body.innerText.includes('Suggested Posts')
  ) {
    console.log('Reached the end of new posts or found suggested posts.')
    getArticles()
    console.log(1, uniqueItems);
    return
  }

  if (scrollCount < maxScrolls) {
    setTimeout(() => scrollToBottom(), scrollInterval)
    getArticles()
  } else {
    getArticles()
    console.log(2, uniqueItems);
    return 
  }
}

async function getSummary() {
  await scrollToBottom();
  return getChatGPTSummary(Array.from(uniqueItems.values()))
}

async function checkIfPageIsReady() {
  const feedContainer = document.querySelector('main')
  if (feedContainer) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === 'GET_SUMMARY') {
        getSummary().then((summary) => {
          sendResponse({ summary })
        });
        return true;  // This is important to indicate asynchronous response
      } 
    });
  } else {
    setTimeout(checkIfPageIsReady, 1000)
  }
}

checkIfPageIsReady();