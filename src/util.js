export function get(url, callback) {
  fetch(url)
    .then((response) => response.json())
    .then(callback);
}

export function deleteBody(url, body, callback) {
  fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(callback);
}
