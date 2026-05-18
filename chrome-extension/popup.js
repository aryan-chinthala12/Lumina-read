document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('dyslexia-toggle');
  const statusText = document.getElementById('status-text');
  const fontSizeSlider = document.getElementById('font-size-slider');
  const fontSizeValue = document.getElementById('font-size-value');
  const bgColorSelect = document.getElementById('bg-color-select');
  const resetBtn = document.getElementById('reset-btn');

  // Load settings
  chrome.storage.sync.get(['dyslexiaMode', 'fontSize', 'bgColor'], (result) => {
    toggle.checked = !!result.dyslexiaMode;
    statusText.textContent = toggle.checked ? 'Dyslexia Mode is ON' : 'Dyslexia Mode is OFF';
    fontSizeSlider.value = result.fontSize || 100;
    fontSizeValue.textContent = (result.fontSize || 100) + '%';
    bgColorSelect.value = result.bgColor || '';
  });

  // Toggle switch
  toggle.addEventListener('change', () => {
    chrome.storage.sync.set({ dyslexiaMode: toggle.checked }, () => {
      statusText.textContent = toggle.checked ? 'Dyslexia Mode is ON' : 'Dyslexia Mode is OFF';
      updateContentScript();
    });
  });

  // Font size slider
  fontSizeSlider.addEventListener('input', () => {
    fontSizeValue.textContent = fontSizeSlider.value + '%';
    chrome.storage.sync.set({ fontSize: fontSizeSlider.value }, updateContentScript);
  });

  // Background color select
  bgColorSelect.addEventListener('change', () => {
    chrome.storage.sync.set({ bgColor: bgColorSelect.value }, updateContentScript);
  });

  // Reset button
  resetBtn.addEventListener('click', () => {
    chrome.storage.sync.set({ fontSize: 100, bgColor: '', dyslexiaMode: false }, () => {
      toggle.checked = false;
      fontSizeSlider.value = 100;
      fontSizeValue.textContent = '100%';
      bgColorSelect.value = '';
      statusText.textContent = 'Dyslexia Mode is OFF';
      updateContentScript();
    });
  });

  function updateContentScript() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ['content.js']
      });
    });
  }
});
