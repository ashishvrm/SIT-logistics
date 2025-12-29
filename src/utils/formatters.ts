export const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;
export const formatDate = (value: string) => new Date(value).toLocaleDateString();
export const formatTime = (value: string) => new Date(value).toLocaleTimeString();
