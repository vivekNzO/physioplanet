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

export const STATUS_OPTIONS = ["Waiting", "In Exercise", "Completed", "Cancelled"] as const
export type StatusOption = typeof STATUS_OPTIONS[number]
