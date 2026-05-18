(function() {
  const styleId = 'dyslexia-mode-global-style';
  function enableDyslexiaMode(fontSize, bgColor) {
    let globalStyle = document.getElementById(styleId);
    if (!globalStyle) {
      globalStyle = document.createElement('style');
      globalStyle.id = styleId;
      document.head.appendChild(globalStyle);
    }
    const regular = chrome.runtime.getURL('fonts/OpenDyslexic-Regular.otf');
    const bold = chrome.runtime.getURL('fonts/OpenDyslexic-Bold.otf');
    const italic = chrome.runtime.getURL('fonts/OpenDyslexic-Italic.otf');
    const boldItalic = chrome.runtime.getURL('fonts/OpenDyslexic-BoldItalic.otf');
    globalStyle.textContent = `
      @font-face {
        font-family: 'OpenDyslexic';
        src: url('${regular}') format('opentype');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'OpenDyslexic';
        src: url('${bold}') format('opentype');
        font-weight: bold;
        font-style: normal;
      }
      @font-face {
        font-family: 'OpenDyslexic';
        src: url('${italic}') format('opentype');
        font-weight: normal;
        font-style: italic;
      }
      @font-face {
        font-family: 'OpenDyslexic';
        src: url('${boldItalic}') format('opentype');
        font-weight: bold;
        font-style: italic;
      }
      html, body, *:not(i):not([class*='icon']):not([class*='fa-']) {
        font-family: 'OpenDyslexic', Arial, sans-serif !important;
      }
      body { font-size: ${fontSize ? fontSize + '%' : '100%'} !important; background: ${bgColor || 'inherit'} !important; }
    `;
  }
  function disableDyslexiaMode() {
    const globalStyle = document.getElementById(styleId);
    if (globalStyle) globalStyle.remove();
    document.body.style.fontFamily = '';
    document.body.style.fontSize = '';
    document.body.style.backgroundColor = '';
  }
  chrome.storage.sync.get(['dyslexiaMode', 'fontSize', 'bgColor'], (result) => {
    if (result.dyslexiaMode) {
      enableDyslexiaMode(result.fontSize, result.bgColor);
    } else {
      disableDyslexiaMode();
    }
  });
})();