const formatDate = (dateString) => {
  if (!dateString) return 'Нет данных';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  }).format(date);
};

export default formatDate;