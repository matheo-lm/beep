(async () => {
    const feedUrls = [
      '/beep/feeds/bleepingcomputer_feed.json',
      '/beep/feeds/thehackersnews_feed.json'
    ];
    let feedItems = [];
    let currentPage = 1;
    let itemsPerPage = parseInt(document.getElementById('itemsPerPage').value);
  
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
          <span class="feed-content">${item.contentSnippet || ''}</span><br>
          <small>${new Date(item.pubDate).toLocaleString()}</small>
        `;
        feedList.appendChild(listItem);
      });
  
      // Update page info
      const pageInfo = document.getElementById('pageInfo');
      pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(feedItems.length / itemsPerPage)}`;
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
  
    // Event listener for items per page selection
    document.getElementById('itemsPerPage').addEventListener('change', (e) => {
      itemsPerPage = parseInt(e.target.value);
      currentPage = 1; // Reset to first page
      displayItems();
    });
  
    // Initial display
    displayItems();
  })();
  