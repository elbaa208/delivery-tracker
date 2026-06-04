function slugify(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w؀-ۿ-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function genId(prefix = 'id') {
  return `${prefix}_${Date.now()}`;
}

module.exports = { slugify, genId };
