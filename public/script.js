document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const usernameInput = document.getElementById('username');
  const labelInput = document.getElementById('label');
  const colorInput = document.getElementById('color');
  const colorHexInput = document.getElementById('colorHex');
  const labelColorInput = document.getElementById('labelColor');
  const labelBgColorInput = document.getElementById('labelBgColor');
  const countColorInput = document.getElementById('countColor');
  const styleOptions = document.querySelectorAll('.style-option');
  const badgePreview = document.getElementById('badgePreview');
  const previewContainer = document.getElementById('preview-container');
  const badgeUrlInput = document.getElementById('badgeUrl');
  const markdownCodeInput = document.getElementById('markdownCode');
  const htmlCodeInput = document.getElementById('htmlCode');
  const copyBadgeUrlBtn = document.getElementById('copyBadgeUrl');
  const copyMarkdownBtn = document.getElementById('copyMarkdown');
  const copyHtmlBtn = document.getElementById('copyHtml');
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  const faqItems = document.querySelectorAll('.faq-item');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  const totalViews = document.getElementById('totalViews');
  const lastUpdated = document.getElementById('lastUpdated');
  
  // Variables
  let currentStyle = 'flat';
  const baseUrl = window.location.origin;
  let debounceTimer;
  let previewImage = null;
  let lastUpdatedParams = '';
  let statsFetchTimer;
  
  // Initialize with demo values
  displayDemoCounter();
  
  // Event listeners with debounce
  usernameInput.addEventListener('input', debounceUpdatePreview);
  labelInput.addEventListener('input', debounceUpdatePreview);
  colorInput.addEventListener('input', handleColorChange);
  colorHexInput.addEventListener('input', handleHexChange);
  
  // Color pickers if they exist
  if (labelColorInput) labelColorInput.addEventListener('input', debounceUpdatePreview);
  if (labelBgColorInput) labelBgColorInput.addEventListener('input', debounceUpdatePreview);
  if (countColorInput) countColorInput.addEventListener('input', debounceUpdatePreview);
  
  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabTarget = tab.getAttribute('data-tab');
      
      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      tab.classList.add('active');
      document.getElementById(`${tabTarget}-tab`).classList.add('active');
    });
  });
  
  // Style selector
  styleOptions.forEach(option => {
    option.addEventListener('click', () => {
      // Remove active class from all options
      styleOptions.forEach(opt => opt.classList.remove('active'));
      
      // Add active class to clicked option
      option.classList.add('active');
      
      // Update current style
      currentStyle = option.getAttribute('data-style');
      
      // Update the badge preview
      debounceUpdatePreview();
    });
  });
  
  // Copy buttons
  copyBadgeUrlBtn.addEventListener('click', () => copyToClipboard(badgeUrlInput.value, 'Badge URL copied!'));
  copyMarkdownBtn.addEventListener('click', () => copyToClipboard(markdownCodeInput.value, 'Markdown code copied!'));
  copyHtmlBtn.addEventListener('click', () => copyToClipboard(htmlCodeInput.value, 'HTML code copied!'));
  
  // Toggle FAQ items
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      // Close other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
        }
      });
      
      // Toggle this item
      item.classList.toggle('active');
    });
  });
  
  // Functions
  function displayDemoCounter() {
    // Show a demo counter for design purposes
    previewContainer.classList.remove('hidden');
    
    const demoImg = document.createElement('img');
    demoImg.src = `${baseUrl}/api/counter?username=demo&label=Profile%20Views&color=6366f1&style=flat`;
    demoImg.alt = 'Demo counter';
    demoImg.style.maxWidth = '100%';
    demoImg.style.maxHeight = '100%';
    badgePreview.innerHTML = '';
    badgePreview.appendChild(demoImg);
    
    // Set demo text values
    badgeUrlInput.value = `${baseUrl}/api/counter?username=yourusername&label=Profile%20Views&color=6366f1&style=flat`;
    markdownCodeInput.value = `![Profile Views](${baseUrl}/api/counter?username=yourusername&label=Profile%20Views&color=6366f1&style=flat)`;
    htmlCodeInput.value = `<img src="${baseUrl}/api/counter?username=yourusername&label=Profile%20Views&color=6366f1&style=flat" alt="Profile Views" />`;
    
    // Set demo stats
    totalViews.textContent = '0';
    lastUpdated.textContent = 'Never';
  }
  
  function debounceUpdatePreview() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(updateBadgePreview, 300);
  }
  
  function handleColorChange(e) {
    const color = e.target.value;
    colorHexInput.value = color.toUpperCase();
    debounceUpdatePreview();
  }
  
  function handleHexChange(e) {
    let hex = e.target.value;
    
    // Check if input is a valid hex color
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      colorInput.value = hex;
      debounceUpdatePreview();
    }
  }
  
  function updateBadgePreview() {
    const username = usernameInput.value.trim();
    const label = labelInput.value.trim() || 'Profile Views';
    const countBgColor = colorInput.value.replace('#', ''); // Main badge color (count background)
    
    // Additional colors if available
    const labelColor = labelColorInput ? labelColorInput.value.replace('#', '') : '555';
    const labelBgColor = labelBgColorInput ? labelBgColorInput.value.replace('#', '') : 'eee';
    const countColor = countColorInput ? countColorInput.value.replace('#', '') : 'fff';
    
    if (!username) {
      // Display demo when no username is entered
      displayDemoCounter();
      return;
    }
    
    // Show preview container
    previewContainer.classList.remove('hidden');
    
    // Current parameters for comparison
    const currentParams = `${username}-${label}-${countBgColor}-${labelColor}-${labelBgColor}-${countColor}-${currentStyle}`;
    
    // Only update if parameters have changed
    if (currentParams !== lastUpdatedParams) {
      lastUpdatedParams = currentParams;
      
      // Add all color parameters to URL
      const badgeUrl = `${baseUrl}/api/counter?username=${encodeURIComponent(username)}` + 
                       `&label=${encodeURIComponent(label)}` +
                       `&color=${encodeURIComponent(countBgColor)}` +
                       `&labelColor=${encodeURIComponent(labelColor)}` +
                       `&labelBgColor=${encodeURIComponent(labelBgColor)}` +
                       `&countColor=${encodeURIComponent(countColor)}` +
                       `&style=${currentStyle}`;
      
      // Add timestamp to force refresh
      const previewUrl = `${badgeUrl}&t=${new Date().getTime()}`;
      
      // Update preview image
      if (previewImage) {
        previewImage.src = previewUrl;
      } else {
        previewImage = document.createElement('img');
        previewImage.src = previewUrl;
        previewImage.alt = `${label} for ${username}`;
        previewImage.style.maxWidth = '100%';
        previewImage.style.maxHeight = '100%';
        badgePreview.innerHTML = '';
        badgePreview.appendChild(previewImage);
      }
      
      // Update URL and code inputs
      badgeUrlInput.value = badgeUrl;
      markdownCodeInput.value = `![${label}](${badgeUrl})`;
      htmlCodeInput.value = `<img src="${badgeUrl}" alt="${label}" />`;
      
      // Fetch count stats with debounce to avoid excessive API calls
      clearTimeout(statsFetchTimer);
      statsFetchTimer = setTimeout(() => fetchCountStats(username), 500);
    }
  }
  
  async function fetchCountStats(username) {
    if (!username) {
      totalViews.textContent = '0';
      lastUpdated.textContent = 'Never';
      return;
    }
    
    try {
      // Add timestamp to prevent caching
      const url = `${baseUrl}/api/stats?username=${encodeURIComponent(username)}&t=${new Date().getTime()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Stats API returned ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update stats display - handle both count=0 and count being undefined
      totalViews.textContent = data.count !== undefined ? data.count : '0';
      
      if (data.lastUpdated) {
        const date = new Date(data.lastUpdated);
        lastUpdated.textContent = formatDate(date);
      } else {
        lastUpdated.textContent = 'Never';
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      totalViews.textContent = '0';
      lastUpdated.textContent = 'Never';
    }
  }
  
  function formatDate(date) {
    // Check if date is valid
    if (!(date instanceof Date) || isNaN(date)) {
      return 'N/A';
    }
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    // Format based on elapsed time
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      // Format as date for older entries
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }
  
  function copyToClipboard(text, successMessage) {
    navigator.clipboard.writeText(text)
      .then(() => showToast(successMessage, true))
      .catch(() => showToast('Failed to copy to clipboard', false));
  }
  
  function showToast(message, isSuccess) {
    toastMessage.textContent = message;
    
    // Set icon based on success/failure
    const icon = toast.querySelector('i');
    if (isSuccess) {
      icon.className = 'fa-solid fa-check';
      icon.style.color = 'var(--success-color)';
    } else {
      icon.className = 'fa-solid fa-triangle-exclamation';
      icon.style.color = 'var(--error-color)';
    }
    
    // Show toast with animation
    toast.classList.remove('hidden');
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      toast.classList.add('hide');
      setTimeout(() => {
        toast.classList.add('hidden');
        toast.classList.remove('hide');
      }, 300);
    }, 3000);
  }
});