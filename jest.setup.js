// Jest setup file
require('@testing-library/jest-dom');

// Mock DOM elements that animations expect
document.body.innerHTML = `
  <div class="stage" id="ssl-stage">
    <div class="step-indicator" id="ssl-status"></div>
    <div class="entity client"></div>
    <div class="entity server">
      <div id="server-keys" style="display:none;"></div>
    </div>
    <div class="entity ca"></div>
  </div>
  <button id="ssl-play">Play</button>
  <button id="ssl-step">Step</button>
  <button id="ssl-reset">Reset</button>
`;

// Setup global window object
global.window = window;
global.document = document;