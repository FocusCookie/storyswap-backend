module.exports.isValidDate = (date) => {
  return (
    date &&
    Object.prototype.toString.call(date) === "[object Date]" &&
    !isNaN(date)
  );
};

module.exports.firstDateIsPastDayComparedToSecond = (firstDate, secondDate) => {
  if (firstDate.setHours(0, 0, 0, 0) - secondDate.setHours(0, 0, 0, 0) >= 0) {
    //first date is in future, or it is today
    return false;
  }

  return true;
};
