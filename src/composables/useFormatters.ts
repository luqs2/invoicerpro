export function useFormatters() {
  function formatCurrency(amount: number, currency = 'MYR') {
    const symbols: Record<string, string> = { MYR: 'RM', USD: '$', SGD: 'S$' }
    const symbol = symbols[currency] ?? currency
    return `${symbol} ${amount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-MY', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  }

  function getInitials(name: string) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  }

  return { formatCurrency, formatDate, getInitials }
}
