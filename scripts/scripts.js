(async () => {
  const feedUrls = [
    '/beep/feeds/bpc.json',
    '/beep/feeds/thn.json',
    '/beep/feeds/kbs.json',
    '/beep/feeds/gpz.json',
    '/beep/feeds/gsr.json',
    '/beep/feeds/rf.json'
  ];
  let feedItems = [];
  let currentPage = 1;
  let itemsPerPage = parseInt(document.getElementById('itemsPerPage').value);
  let filteredItems = [];
  const headerTitle = document.querySelector('.header-title a');
  const darkModeToggle = document.getElementById('darkModeToggle');

  // Show loading message
  document.getElementById('feed-list').innerHTML = '<li>Loading...</li>';

  // Fetch and combine feed items
  for (const url of feedUrls) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const feed = await response.json();
      feedItems = feedItems.concat(feed.items);
    } catch (error) {
      // console.error(`Error fetching or parsing feed at ${url}:`, error);
      // Fallback to local files
      try {
        const localResponse = await fetch(`feeds/${url.split('/').pop()}`);
        if (!localResponse.ok) throw new Error('Local network response was not ok');
        const localFeed = await localResponse.json();
        feedItems = feedItems.concat(localFeed.items);
      } catch (localError) {
        console.error(`Error fetching or parsing local feed at ${url}:`, localError);
      }
    }
  }

  // Sort items by publication date
  feedItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  filteredItems = feedItems;

  // Function to update pagination buttons
  function updatePaginationButtons() {
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === Math.ceil(filteredItems.length / itemsPerPage);
  }

  // Function to scroll to the top of the page
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Function to display items for the current page
  function displayItems() {
    const feedList = document.getElementById('feed-list');
    feedList.innerHTML = '';

    if (filteredItems.length === 0) {
      feedList.innerHTML = '<li>Sorry, no articles found. Please check back later for updates.</li>';
      return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = filteredItems.slice(startIndex, endIndex);

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
    pageInfo.textContent = `${currentPage} of ${Math.ceil(filteredItems.length / itemsPerPage)}`;

    // Update total article count
    const totalArticleCount = document.getElementById('totalArticleCount');
    totalArticleCount.textContent = `Total articles: ${filteredItems.length}`;

    // Update pagination buttons
    updatePaginationButtons();

    // Scroll to the top of the page after displaying items
    scrollToTop();
  }

  // Function to filter items based on search keyword
  function filterItems(keyword) {
    filteredItems = feedItems.filter(item => 
      item.title.toLowerCase().includes(keyword.toLowerCase()) ||
      (item.content && item.content.toLowerCase().includes(keyword.toLowerCase())) ||
      (item.contentSnippet && item.contentSnippet.toLowerCase().includes(keyword.toLowerCase()))
    );
    currentPage = 1; // Reset to first page
    displayItems();
  }

  // Function to filter items by tag
  function filterItemsByTag(tag) {
    filteredItems = feedItems.filter(item => item.tag === tag);
    currentPage = 1; // Reset to first page
    displayItems();
    headerTitle.textContent = `Latest Cyber ${tag.charAt(0).toUpperCase() + tag.slice(1)}`;
  }

  // Function to filter items by date range
  function filterItemsByDateRange(startDate, endDate) {
    filteredItems = feedItems.filter(item => {
      const itemDate = new Date(item.isoDate);
      return itemDate >= startDate && itemDate <= endDate;
    });
    currentPage = 1; // Reset to first page
    displayItems();
  }

  // Function to toggle dark mode
  function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const darkModeEnabled = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', darkModeEnabled);
    darkModeToggle.textContent = darkModeEnabled ? '\u2600' : '\uD83C\uDF13';
  }

  // Event listeners for date range buttons
  document.getElementById('filter1d').addEventListener('click', () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 1);
    filterItemsByDateRange(startDate, endDate);
  });

  document.getElementById('filter5d').addEventListener('click', () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 5);
    filterItemsByDateRange(startDate, endDate);
  });

  document.getElementById('filter7d').addEventListener('click', () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    filterItemsByDateRange(startDate, endDate);
  });

  // Event listener for custom date range
  document.getElementById('customDateRange').addEventListener('change', (e) => {
    const [start, end] = e.target.value.split(' - ');
    const startDate = new Date(start);
    const endDate = new Date(end);
    filterItemsByDateRange(startDate, endDate);
  });

  // Event listeners for pagination buttons
  document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      displayItems();
    }
  });

  document.getElementById('nextPage').addEventListener('click', () => {
    if (currentPage < Math.ceil(filteredItems.length / itemsPerPage)) {
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

  // Event listener for search button
  document.getElementById('searchButton').addEventListener('click', () => {
    const keyword = document.getElementById('searchInput').value;
    filterItems(keyword);
  });

  // Event listener for search input to execute search on Enter key press
  document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const keyword = e.target.value;
      filterItems(keyword);
    }
  });

  // Event listener for "Scholarly" link in the navigation bar
  document.querySelector('.nav-link[href="#scholarly"]').addEventListener('click', () => {
    filterItemsByTag('scholarly');
  });

  // Event listener for "Hackcidents" link in the navigation bar
  document.querySelector('.nav-link[href="#hackcidents"]').addEventListener('click', () => {
    filterItemsByTag('hackcidents');
  });

  // Event listener for "Intel" link in the navigation bar
  document.querySelector('.nav-link[href="#intel"]').addEventListener('click', () => {
    filterItemsByTag('intel');
  });

  // Event listener for "News" link in the navigation bar
  document.querySelector('.nav-link[href="#news"]').addEventListener('click', () => {
    filterItemsByTag('news');
  });

  // Event listener for "Exploits" link in the navigation bar
  document.querySelector('.nav-link[href="#exploits"]').addEventListener('click', () => {
    filterItemsByTag('exploits');
  });

  // Event listener for dark mode toggle
  darkModeToggle.addEventListener('click', toggleDarkMode);

  // Check for saved dark mode preference
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    darkModeToggle.textContent = 'Light Mode';
  }

  // Initial display
  displayItems();

  $(document).ready(function() {
    $('#customDateRange').daterangepicker({
      opens: 'left',
      locale: {
        format: 'YYYY-MM-DD'
      }
    }, function(start, end, label) {
      const startDate = new Date(start.format('YYYY-MM-DD'));
      const endDate = new Date(end.format('YYYY-MM-DD'));
      filterItemsByDateRange(startDate, endDate);
    });
  });
})();
