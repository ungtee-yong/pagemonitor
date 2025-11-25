const dateFormatter = new Intl.DateTimeFormat('th-TH', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

export function formatDateTime(value) {
  if (!value) return '-';
  try {
    return dateFormatter.format(new Date(value));
  } catch {
    return value;
  }
}

export function trimMessage(message = '', length = 120) {
  if (message.length <= length) return message;
  return `${message.slice(0, length).trim()}…`;
}
