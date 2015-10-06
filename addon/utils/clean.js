export default function clean(hash) {
  const cleaned = {};
  for (let key in hash) {
    if (hash[key] !== undefined) {
      if (typeof hash[key] === "object") {
        cleaned[key] = clean(hash[key]);
      } else {
        cleaned[key] = hash[key];
      }
    }
  }
  return cleaned;
}