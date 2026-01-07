export const getDefaultStatus = (startAt: string): "Waiting" | "In Exercise" | "Completed" => {
  const now = new Date()
  const appointmentStart = new Date(startAt)
  const appointmentEnd = new Date(appointmentStart.getTime() + 30 * 60 * 1000)

  if (now < appointmentStart) {
    return "Waiting"
  } else if (now >= appointmentStart && now < appointmentEnd) {
    return "In Exercise"
  } else {
    return "Completed"
  }
}

/**
 * Get appointment status based on startAt and endAt times
 * - If startAt is null → WAITING
 * - If now < startAt → WAITING
 * - If now >= startAt && (endAt is null || now <= endAt) → IN_EXERCISE
 * - If endAt exists && now > endAt → COMPLETED
 */
export const getStatusFromTimes = (
  startAt: string | null | undefined,
  endAt: string | null | undefined
): "Waiting" | "In Exercise" | "Completed" => {
  const now = new Date()
  
  // If no startAt, always WAITING
  if (!startAt) {
    return "Waiting"
  }
  
  const appointmentStart = new Date(startAt)
  
  // Before start time → WAITING
  if (now < appointmentStart) {
    return "Waiting"
  }
  
  // If no endAt, check if we're past start → IN_EXERCISE
  if (!endAt) {
    return "In Exercise"
  }
  
  const appointmentEnd = new Date(endAt)
  
  // During appointment time → IN_EXERCISE
  if (now >= appointmentStart && now <= appointmentEnd) {
    return "In Exercise"
  }
  
  // After end time → COMPLETED
  return "Completed"
}

export const STATUS_OPTIONS = ["Waiting", "In Exercise", "Completed", "Cancelled"] as const
export type StatusOption = typeof STATUS_OPTIONS[number]
