function escape(string) {
  return string.replace(/'/g, "''");
}

function format(string) {
  return string === undefined || string === null ? null : `'${string}'`;
}

module.exports = { escape, format };
