"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

type Props = {
  eventId: number
  userId: number
}

export default function AttendancePage({ eventId, userId }: Props) {
  const [isMarked, setIsMarked] = useState(false)
  const { token } = useAuth()

  const handleMarkAttendance = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/events/${eventId}/attendance/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error("Failed to mark attendance")

      setIsMarked(true)
      toast({
        title: "Success",
        description: "Attendance marked successfully!",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to mark attendance.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-4">
      <Button
        disabled={isMarked}
        onClick={handleMarkAttendance}
        className={isMarked ? "bg-green-600 hover:bg-green-700" : ""}
      >
        {isMarked ? "Attendance Marked" : "Mark Attendance"}
      </Button>
    </div>
  )
}
