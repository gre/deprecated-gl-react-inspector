const LRU = require("lru-cache");

const cache = LRU({
  max: 50,
  dispose: (key, n) => { n.src = null; }
});

const pendings = {};

function load (src) {
  pendings[src] = { handlers: [] };
  const img = new Image();
  img.crossOrigin = true;
  img.onload = () => {
    cache.set(src, img);
    pendings[src].handlers.forEach(handler => handler(img));
    delete pendings[src];
  };
  img.src = src;
}

module.exports = {
  get (src) {
    return cache.get(src);
  },
  load (src, onload) {
    const img = cache.get(src);
    if (img) {
      if (onload) onload(img);
    }
    else {
      if (!pendings[src]) load(src);
      if (onload) pendings[src].handlers.push(onload);
    }
  }
};
