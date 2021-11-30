module.exports.isValideIsbnOrIsbn13 = (isbnOrIsbn13) => {
  if (!isbnOrIsbn13) return false;

  if (isbnOrIsbn13.length < 9 || isbnOrIsbn13.length > 13) return false;

  const onlyNumbersAndDashRegex = /^[0-9-]*$/;
  if (!onlyNumbersAndDashRegex.test(isbnOrIsbn13)) return false;

  return true;
};
