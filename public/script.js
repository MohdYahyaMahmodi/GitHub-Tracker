document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const usernameInput = document.getElementById('username');
  const generateBadgeBtn = document.getElementById('generateBadge');
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
  
  // Initialize preview with placeholder text
  displayDemoCounter();
  
  // Update preview only when the user presses Enter or clicks "Generate"
  usernameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      updateBadgePreview();
    }
  });
  
  generateBadgeBtn.addEventListener('click', updateBadgePreview);
  
  // Other fields update on input
  labelInput.addEventListener('input', debounceUpdatePreview);
  colorInput.addEventListener('input', handleColorChange);
  colorHexInput.addEventListener('input', handleHexChange);
  
  if (labelColorInput) labelColorInput.addEventListener('input', debounceUpdatePreview);
  if (labelBgColorInput) labelBgColorInput.addEventListener('input', debounceUpdatePreview);
  if (countColorInput) countColorInput.addEventListener('input', debounceUpdatePreview);
  
  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabTarget = tab.getAttribute('data-tab');
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`${tabTarget}-tab`).classList.add('active');
    });
  });
  
  // Style selector
  styleOptions.forEach(option => {
    option.addEventListener('click', () => {
      styleOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      currentStyle = option.getAttribute('data-style');
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
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
        }
      });
      item.classList.toggle('active');
    });
  });
  
  // Functions
  function displayDemoCounter() {
    previewContainer.classList.remove('hidden');
    // Show placeholder text instead of a demo image
    badgePreview.innerHTML = '<p class="placeholder-text">Please enter a username or repository name to track</p>';
    
    badgeUrlInput.value = `${baseUrl}/api/counter?username=yourusername&label=Profile%20Views&color=6366f1&style=flat`;
    markdownCodeInput.value = `![Profile Views](${baseUrl}/api/counter?username=yourusername&label=Profile%20Views&color=6366f1&style=flat)`;
    htmlCodeInput.value = `<img src="${baseUrl}/api/counter?username=yourusername&label=Profile%20Views&color=6366f1&style=flat" alt="Profile Views" />`;
    
    totalViews.textContent = '0';
    lastUpdated.textContent = 'Never';
  }
  
  function debounceUpdatePreview() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(updateBadgePreview, 50);
  }
  
  function handleColorChange(e) {
    const color = e.target.value;
    colorHexInput.value = color.toUpperCase();
    debounceUpdatePreview();
  }
  
  function handleHexChange(e) {
    let hex = e.target.value;
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      colorInput.value = hex;
      debounceUpdatePreview();
    }
  }
  
  function updateBadgePreview() {
    const username = usernameInput.value.trim();
    const label = labelInput.value.trim() || 'Profile Views';
    const countBgColor = colorInput.value.replace('#', '');
    const labelColor = labelColorInput ? labelColorInput.value.replace('#', '') : '555';
    const labelBgColor = labelBgColorInput ? labelBgColorInput.value.replace('#', '') : 'eee';
    const countColor = countColorInput ? countColorInput.value.replace('#', '') : 'fff';
    
    if (!username) {
      displayDemoCounter();
      return;
    }
    
    previewContainer.classList.remove('hidden');
    const currentParams = `${username}-${label}-${countBgColor}-${labelColor}-${labelBgColor}-${countColor}-${currentStyle}`;
    
    if (currentParams !== lastUpdatedParams) {
      lastUpdatedParams = currentParams;
      const badgeUrl = `${baseUrl}/api/counter?username=${encodeURIComponent(username)}` +
                       `&label=${encodeURIComponent(label)}` +
                       `&color=${encodeURIComponent(countBgColor)}` +
                       `&labelColor=${encodeURIComponent(labelColor)}` +
                       `&labelBgColor=${encodeURIComponent(labelBgColor)}` +
                       `&countColor=${encodeURIComponent(countColor)}` +
                       `&style=${currentStyle}`;
      const previewUrl = `${badgeUrl}&noCount=true&t=${new Date().getTime()}`;
      
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
      
      badgeUrlInput.value = badgeUrl;
      markdownCodeInput.value = `![${label}](${badgeUrl})`;
      htmlCodeInput.value = `<img src="${badgeUrl}" alt="${label}" />`;
      
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
      const url = `${baseUrl}/api/stats?username=${encodeURIComponent(username)}&t=${new Date().getTime()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Stats API returned ${response.status}`);
      }
      
      const data = await response.json();
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
    if (!(date instanceof Date) || isNaN(date)) {
      return 'N/A';
    }
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
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
    const icon = toast.querySelector('i');
    if (isSuccess) {
      icon.className = 'fa-solid fa-check';
      icon.style.color = 'var(--success-color)';
    } else {
      icon.className = 'fa-solid fa-triangle-exclamation';
      icon.style.color = 'var(--error-color)';
    }
    
    toast.classList.remove('hidden');
    toast.classList.add('show');
    
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
