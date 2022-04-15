export const getTrimmedWord = (word: string) => {
  return word.length > 15 ? `${word.substring(0, 15)}...` : word;
};

export const formatDate = (date: string | undefined) => {
  if (!date) return date;

  const [dateToSplit] = date.split('T');
  const [year, month, day] = dateToSplit.split('-');

  return `${day}/${month}/${year}`;
}