// eslint-disable-next-line import/prefer-default-export
export function get(url, callback) {
  fetch(url)
    .then((response) => response.json())
    .then(callback);
}
