"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CheckCircle, Clock, MapPin } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

type Event = {
  id: string
  title: string
  date: string
  time: string
  location: string
  hasAttended: boolean
}

export default function MarkAttendancePage() {
  const { token } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [attendanceCode, setAttendanceCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const eventId = params.id as string

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await fetch(`/api/event/${eventId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch event details")
        }

        const data = await response.json()
        setEvent(data)
      } catch (error) {
        console.error("Error fetching event details:", error)
        setError("Failed to load event details. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEventDetails()
  }, [eventId, token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/attendance/${eventId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: attendanceCode }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to mark attendance")
      }

      toast({
        title: "Attendance marked",
        description: "Your attendance has been successfully recorded",
      })

      // Update the event data to reflect attendance
      setEvent((prev) => {
        if (!prev) return null
        return {
          ...prev,
          hasAttended: true,
        }
      })
    } catch (error) {
      toast({
        title: "Failed to mark attendance",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto">
        <Skeleton className="h-8 w-2/3 mb-4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button asChild>
          <Link href="/attendance">Back to Attendance</Link>
        </Button>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-xl font-medium mb-4">Event not found</p>
        <Button asChild>
          <Link href="/attendance">Back to Attendance</Link>
        </Button>
      </div>
    )
  }

  const isEventPast = new Date(event.date) < new Date()
  const canMarkAttendance = isEventPast && !event.hasAttended

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-4">
        {event.hasAttended ? "Attendance Confirmed" : "Mark Attendance"}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>{event.title}</CardTitle>
          <CardDescription>
            {event.hasAttended
              ? "Your attendance has been recorded"
              : "Enter the attendance code to mark your attendance"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 opacity-70" />
              <span>Date: {formatDate(event.date)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 opacity-70" />
              <span>Time: {event.time}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 opacity-70" />
              <span>Location: {event.location}</span>
            </div>
          </div>

          {event.hasAttended ? (
            <div className="flex items-center justify-center p-4 bg-primary/10 rounded-md">
              <CheckCircle className="h-5 w-5 text-primary mr-2" />
              <span className="font-medium">Attendance Confirmed</span>
            </div>
          ) : !isEventPast ? (
            <div className="p-4 bg-muted rounded-md text-center">
              <p>This event hasn't started yet. You can mark your attendance once the event begins.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="attendanceCode">Attendance Code</Label>
                <Input
                  id="attendanceCode"
                  value={attendanceCode}
                  onChange={(e) => setAttendanceCode(e.target.value)}
                  placeholder="Enter the code provided by the organizer"
                  required
                />
              </div>
              <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Mark Attendance"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href="/attendance">Back to Attendance</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

