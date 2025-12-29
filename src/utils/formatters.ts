export const formatCurrency = (amount?: number) => {
  if (amount === undefined || amount === null) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const formatDate = (value?: string) => {
  if (!value) return 'N/A';
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return 'Invalid Date';
  }
};

export const formatTime = (value?: string) => {
  if (!value) return 'N/A';
  try {
    return new Date(value).toLocaleTimeString();
  } catch {
    return 'Invalid Time';
  }
};
