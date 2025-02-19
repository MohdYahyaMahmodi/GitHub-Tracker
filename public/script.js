document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const usernameInput = document.getElementById('username');
  const labelInput = document.getElementById('label');
  const colorInput = document.getElementById('color');
  const colorHexInput = document.getElementById('colorHex');
  const styleOptions = document.querySelectorAll('.style-option');
  const badgePreview = document.getElementById('badgePreview');
  const badgeUrlInput = document.getElementById('badgeUrl');
  const markdownCodeInput = document.getElementById('markdownCode');
  const htmlCodeInput = document.getElementById('htmlCode');
  const copyBadgeUrlBtn = document.getElementById('copyBadgeUrl');
  const copyMarkdownBtn = document.getElementById('copyMarkdown');
  const copyHtmlBtn = document.getElementById('copyHtml');
  const faqItems = document.querySelectorAll('.faq-item');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  
  // Variables
  let currentStyle = 'flat';
  const baseUrl = window.location.origin;
  
  // Initialize
  updateBadge();
  
  // Event listeners
  usernameInput.addEventListener('input', updateBadge);
  labelInput.addEventListener('input', updateBadge);
  colorInput.addEventListener('input', handleColorChange);
  colorHexInput.addEventListener('input', handleHexChange);
  
  styleOptions.forEach(option => {
    option.addEventListener('click', () => {
      // Remove active class from all options
      styleOptions.forEach(opt => opt.classList.remove('active'));
      
      // Add active class to clicked option
      option.classList.add('active');
      
      // Update current style
      currentStyle = option.getAttribute('data-style');
      
      // Update the badge
      updateBadge();
    });
  });
  
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
  function handleColorChange(e) {
    const color = e.target.value;
    colorHexInput.value = color;
    updateBadge();
  }
  
  function handleHexChange(e) {
    let hex = e.target.value;
    
    // Check if input is a valid hex color
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      colorInput.value = hex;
      updateBadge();
    }
  }
  
  function updateBadge() {
    const username = usernameInput.value.trim();
    const label = labelInput.value.trim();
    const color = colorInput.value;
    
    if (!username) {
      // Display example badge
      badgePreview.innerHTML = `<p class="placeholder-text">Enter a username to preview your badge</p>`;
      badgeUrlInput.value = '';
      markdownCodeInput.value = '';
      htmlCodeInput.value = '';
      return;
    }
    
    // Construct the counter URL
    const counterUrl = `${baseUrl}/api/counter?username=${encodeURIComponent(username)}&label=${encodeURIComponent(label)}&color=${encodeURIComponent(color.replace('#', ''))}&style=${currentStyle}`;
    
    // Generate preview badge
    const img = document.createElement('img');
    img.src = counterUrl;
    img.alt = `${label} for ${username}`;
    badgePreview.innerHTML = '';
    badgePreview.appendChild(img);
    
    // Update URL and code inputs
    badgeUrlInput.value = counterUrl;
    markdownCodeInput.value = `![${label}](${counterUrl})`;
    htmlCodeInput.value = `<img src="${counterUrl}" alt="${label}" />`;
    
    // Fetch current count to show in the badge preview
    fetchCountStats(username);
  }
  
  async function fetchCountStats(username) {
    if (!username) return;
    
    try {
      const response = await fetch(`${baseUrl}/api/stats?username=${encodeURIComponent(username)}`);
      const data = await response.json();
      
      // Can use this data to show additional stats if needed
      console.log('Stats fetched:', data);
    } catch (error) {
      console.error('Error fetching stats:', error);
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
    
    // Show toast
    toast.classList.remove('hidden');
    
    // Hide after 3 seconds
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }
});