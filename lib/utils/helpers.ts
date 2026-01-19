export const formatDate = (date: any): string => {
  if (!date) return 'N/A'
  
  if (date.toDate) {
    date = date.toDate()
  }
  if (date?.seconds && typeof date.seconds === 'number') {
    date = new Date(date.seconds * 1000)
  }
  
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const calculateDueDate = (borrowDate: Date): Date => {
  const dueDate = new Date(borrowDate)
  // Keep this aligned with policy constants.
  // Importing here avoids circular deps in some bundlers, so keep it local.
  const BORROW_DURATION_DAYS = 20
  dueDate.setDate(dueDate.getDate() + BORROW_DURATION_DAYS)
  return dueDate
}

export const calculateDaysOverdue = (dueDate: Date): number => {
  const today = new Date()
  const diffTime = today.getTime() - dueDate.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

export const calculateFine = (dueDate: Date): number => {
  const daysOverdue = calculateDaysOverdue(dueDate)
  return daysOverdue * 1 // $1 per day
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}