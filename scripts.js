(async () => {
    const feedUrls = [
      '/beep/feeds/bleepingcomputer_feed.json',
      '/beep/feeds/thehackersnews_feed.json'
    ];
    let feedItems = [];
    let currentPage = 1;
    let itemsPerPage = parseInt(document.getElementById('itemsPerPage').value);
  
    // Show loading message
    document.getElementById('feed-list').innerHTML = '<li>Loading...</li>';
  
    // Fetch and combine feed items
    for (const url of feedUrls) {
      try {
        const response = await fetch(url);
        const feed = await response.json();
        feedItems = feedItems.concat(feed.items);
      } catch (error) {
        console.error(`Error fetching or parsing feed at ${url}:`, error);
      }
    }
  
    // Sort items by publication date
    feedItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  
    // Function to update pagination buttons
    function updatePaginationButtons() {
      const prevButton = document.getElementById('prevPage');
      const nextButton = document.getElementById('nextPage');
      const prevButtonBottom = document.getElementById('prevPageBottom');
      const nextButtonBottom = document.getElementById('nextPageBottom');
  
      prevButton.disabled = currentPage === 1;
      nextButton.disabled = currentPage === Math.ceil(feedItems.length / itemsPerPage);
      prevButtonBottom.disabled = currentPage === 1;
      nextButtonBottom.disabled = currentPage === Math.ceil(feedItems.length / itemsPerPage);
    }
  
    // Function to display items for the current page
    function displayItems() {
      const feedList = document.getElementById('feed-list');
      feedList.innerHTML = '';
  
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const pageItems = feedItems.slice(startIndex, endIndex);
  
      pageItems.forEach(item => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
          <a href="${item.link}" target="_blank">${item.title}</a><br>
          <div class="feed-content">${item.content || item.contentSnippet || ''}</div>
          <small class="iso-date">${item.isoDate}</small>
        `;
        feedList.appendChild(listItem);
      });
  
      // Update page info
      const pageInfo = document.getElementById('pageInfo');
      pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(feedItems.length / itemsPerPage)}`;
  
      const pageInfoBottom = document.getElementById('pageInfoBottom');
      pageInfoBottom.textContent = `Page ${currentPage} of ${Math.ceil(feedItems.length / itemsPerPage)}`;
  
      // Update total article count
      const totalArticleCount = document.getElementById('totalArticleCount');
      totalArticleCount.textContent = `Total articles available: ${feedItems.length}`;
  
      // Update pagination buttons
      updatePaginationButtons();
    }
  
    // Event listeners for pagination buttons
    document.getElementById('prevPage').addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        displayItems();
      }
    });
  
    document.getElementById('nextPage').addEventListener('click', () => {
      if (currentPage < Math.ceil(feedItems.length / itemsPerPage)) {
        currentPage++;
        displayItems();
      }
    });
  
    document.getElementById('prevPageBottom').addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        displayItems();
      }
    });
  
    document.getElementById('nextPageBottom').addEventListener('click', () => {
      if (currentPage < Math.ceil(feedItems.length / itemsPerPage)) {
        currentPage++;
        displayItems();
      }
    });
  
    // Event listener for items per page selection
    document.getElementById('itemsPerPage').addEventListener('change', (e) => {
      itemsPerPage = parseInt(e.target.value);
      currentPage = 1; // Reset to first page
      displayItems();
    });
  
    // Event listener for the "Latest Cyber News" link
    document.getElementById('homeLink').addEventListener('click', (e) => {
      e.preventDefault();
      currentPage = 1;
      displayItems();
    });
  
    document.getElementById('homeLinkBottom').addEventListener('click', (e) => {
      e.preventDefault();
      currentPage = 1;
      displayItems();
    });
  
    // Initial display
    displayItems();
  })();