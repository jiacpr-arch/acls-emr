// Web Worker for accurate timer — runs even when tab is hidden
let intervalId = null;
let startTime = null;

self.onmessage = function (e) {
  const { type, payload } = e.data;

  switch (type) {
    case 'START':
      startTime = Date.now() - (payload?.elapsed || 0) * 1000;
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        self.postMessage({ type: 'TICK', elapsed });
      }, 200); // tick every 200ms for smooth display
      break;

    case 'STOP':
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      break;

    case 'RESET':
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      startTime = null;
      self.postMessage({ type: 'TICK', elapsed: 0 });
      break;

    case 'GET_ELAPSED':
      if (startTime) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        self.postMessage({ type: 'TICK', elapsed });
      }
      break;
  }
};
