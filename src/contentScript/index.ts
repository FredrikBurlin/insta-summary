console.info('contentScript is running hi')

/// example of scrolling 10 times
let scrollCount = 0
const maxScrolls = 10
const scrollInterval = 2000 // 2 seconds

// Function to extract data from an article element
function extractData(article: HTMLElement) {
  const username = article.querySelector('a[href^="/"]')?.textContent ?? 'unknown'
  const description = article.querySelectorAll('span[dir="auto"]')
  const image = article.querySelectorAll('img[alt]')

  return {
    who: username,
    description: `${username}\n${description}`,
    image: image,
  }
}

// Start checking if the page is ready
checkIfPageIsReady()
console.log('here')

function getArticles() {
  // Select all article elements
  const articles = document.querySelectorAll('article')

  // Extract data from each article
  const data = Array.from(articles).map((article) => extractData(article))

  // Log the data to the console
  console.log(data)
}

export {}

// example of text extraction

function scrollToBottom() {
  window.scrollTo(0, document.body.scrollHeight)
  scrollCount++

  if (
    document.body.innerText.includes('seen all new posts') ||
    document.body.innerText.includes('Suggested Posts')
  ) {
    console.log('Reached the end of new posts or found suggested posts.')
    categorizePosts()
    getArticles()
    return
  }

  if (scrollCount < maxScrolls) {
    setTimeout(scrollToBottom, scrollInterval)
    getArticles()
  } else {
    categorizePosts()
    getArticles()
  }
}

function checkIfPageIsReady() {
  const feedContainer = document.querySelector('main')
  if (feedContainer) {
    scrollToBottom()
  } else {
    setTimeout(checkIfPageIsReady, 1000)
  }
}

function categorizePosts() {
  const posts = document.querySelectorAll('article')
  const categorizedPosts = {
    followed: [] as string[],
    suggested: [] as string[],
    sponsored: [] as string[],
  }

  posts.forEach((post: HTMLElement) => {
    if (post.innerText.startsWith('Suggested')) {
      categorizedPosts.suggested.push(post.innerText)
    } else if (post.innerText.includes('Sponsored')) {
      categorizedPosts.sponsored.push(post.innerText)
    } else {
      categorizedPosts.followed.push(post.innerText)
    }
  })

  console.log(JSON.stringify(categorizedPosts, null, 2))
}

// Start checking if the page is ready
checkIfPageIsReady()
