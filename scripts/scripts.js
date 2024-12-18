(async () => {
  const feedUrls = [
    '/beep/feeds/bpc.json',
    '/beep/feeds/thn.json',
    '/beep/feeds/kbs.json',
    '/beep/feeds/breaches-net.json',
    '/beep/feeds/gpz.json',
    '/beep/feeds/gsr.json',
    '/beep/feeds/sn1.json',
    '/beep/feeds/rf.json',
    '/beep/feeds/ktn-gsc.json',
    // '/beep/feeds/merged.json'
  ];
  let feedItems = [];
  let currentPage = 1;
  let itemsPerPage = 25; // Default value
  const itemsPerPageElement = document.getElementById('itemsPerPage');
  if (itemsPerPageElement) {
    itemsPerPage = parseInt(itemsPerPageElement.value);
  }
  let filteredItems = [];
  const headerTitle = document.querySelector('.header-title a');
  const darkModeToggle = document.getElementById('darkModeToggle');

  // Show loading message
  document.getElementById('feed-list').innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 100%;"><img src="/img/spinner.svg" alt="Loading..." class="spinner" style="width: 50px; height: 50px;"></div>';

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

  // Function to scroll to the top of the page
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Function to update footer information
  function updateFooterInfo() {
    const totalArticlesBadge = document.getElementById('totalArticlesBadge');
    const lastUpdatedBadge = document.getElementById('lastUpdatedBadge');
    const lastUpdated = new Date().toLocaleString();
    totalArticlesBadge.textContent = `Total articles: ${filteredItems.length}`;
    lastUpdatedBadge.textContent = `Last updated: ${lastUpdated} EST`;
  }

  function getIconForTag(tag) {
    switch (tag) {
      case 'intel':
        return 'img/intel.svg';
      case 'news':
        return 'img/news.svg';
      case 'scholarly':
        return 'img/scholarly.svg';
      case 'hackcidents':
        return 'img/hackcidents.svg';
      case 'exploits':
        return 'img/exploit.svg';
      default:
        return 'img/default.svg';
    }
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
      const iconSrc = getIconForTag(item.tag);
      listItem.innerHTML = `
        <img src="${iconSrc}" alt="${item.tag}" class="article-icon">
        <a href="${item.link}" target="_blank">${item.title}</a><br>
        <div class="feed-content">${item.content || item.contentSnippet || ''}</div>
        <small class="iso-date">${item.isoDate}</small>
      `;
      feedList.appendChild(listItem);
    });

    // Update total article count
    // const totalArticleCount = document.getElementById('totalArticleCount');
    // totalArticleCount.textContent = `Total articles: ${filteredItems.length}`;

    // Update footer information
    updateFooterInfo();
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
    // Update filter menu styles
    const filterOptions = document.getElementById('filterOptions');
    if (darkModeEnabled) {
      filterOptions.classList.add('dark-mode');
    } else {
      filterOptions.classList.remove('dark-mode');
    }
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

  // Event listener for items per page selection
  if (itemsPerPageElement) {
    itemsPerPageElement.addEventListener('change', (e) => {
      itemsPerPage = parseInt(e.target.value);
      currentPage = 1; // Reset to first page
      displayItems();
    });
  }

  // Event listener for search button
  document.getElementById('searchButton').addEventListener('click', (e) => {
    e.preventDefault(); // Prevent form submission
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
    darkModeToggle.textContent = '\u2600';
  }

  // Initial display
  displayItems();
  updateFooterInfo();

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

    $('#filtersButton').on('click', function() {
      $(this).toggleClass('active');
      if ($(this).hasClass('active')) {
        $(this).html('<i class="bi bi-x-circle"></i> Close Filters');
      } else {
        $(this).html('<i class="bi bi-funnel"></i> Filters');
      }
      $('html, body').animate({
        scrollTop: $("#filterOptions").offset().top
      }, 500);
    });

    $('#filterOptions').on('hidden.bs.collapse', function () {
      $('#filtersButton').removeClass('active').html('<i class="bi bi-funnel"></i> Filters');
    });

    $('#clearFiltersButton').on('click', function() {
      $('#itemsPerPage').val('25');
      $('#searchInput').val('');
      $('#customDateRange').val('');
      filteredItems = feedItems;
      currentPage = 1;
      displayItems();
    });
  });

  // Function to load more content
  async function loadMoreContent() {
    const nextPage = currentPage + 1;
    const startIndex = (nextPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = filteredItems.slice(startIndex, endIndex);

    if (pageItems.length > 0) {
      const feedList = document.getElementById('feed-list');
      pageItems.forEach(item => {
        const listItem = document.createElement('li');
        const iconSrc = getIconForTag(item.tag);
        listItem.innerHTML = `
          <div>
            <img src="${iconSrc}" alt="${item.tag}" class="article-icon">
              <a href="${item.link}" target="_blank">${item.title}</a><br>
              <div class="feed-content">${item.content || item.contentSnippet || ''}
              <small class="iso-date">${item.isoDate}</small>
            </div>
          </div>
        `;
        feedList.appendChild(listItem);
      });
      currentPage = nextPage;
      updateFooterInfo();
    } else {
      document.getElementById('loadMoreButton').style.display = 'none';
    }
  }

  // Infinite scrolling implementation
  window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
      loadMoreContent();
    }
  });

  // Initial display
  displayItems();
  updateFooterInfo();

  // Add event listener for "Load More" button
  document.getElementById('loadMoreButton').addEventListener('click', loadMoreContent);
})();
