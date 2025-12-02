const relativeFormatter = new Intl.RelativeTimeFormat('th-TH', {
  numeric: 'auto',
});

const dateTimeFormatter = new Intl.DateTimeFormat('th-TH', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const units = [
  { limit: 60, value: 1, unit: 'second' },
  { limit: 3600, value: 60, unit: 'minute' },
  { limit: 86400, value: 3600, unit: 'hour' },
  { limit: 604800, value: 86400, unit: 'day' },
  { limit: 2629800, value: 604800, unit: 'week' },
  { limit: 31557600, value: 2629800, unit: 'month' },
];

export const formatRelativeTime = (isoString) => {
  if (!isoString) return '-';
  const diffInSeconds = (Date.now() - new Date(isoString).getTime()) / 1000;
  const abs = Math.abs(diffInSeconds);

  for (const unit of units) {
    if (abs < unit.limit) {
      return relativeFormatter.format(
        Math.round(diffInSeconds / unit.value),
        unit.unit
      );
    }
  }

  return relativeFormatter.format(Math.round(diffInSeconds / 31557600), 'year');
};

export const formatDateTime = (isoString) => {
  if (!isoString) return '-';
  try {
    return dateTimeFormatter.format(new Date(isoString));
  } catch {
    return isoString;
  }
};
