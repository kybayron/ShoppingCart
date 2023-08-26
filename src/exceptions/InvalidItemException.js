class InvalidItemException extends Error {
  constructor(item) {
    super(`The item ${item} does not exist.`);
  }
}

module.exports = InvalidItemException;
