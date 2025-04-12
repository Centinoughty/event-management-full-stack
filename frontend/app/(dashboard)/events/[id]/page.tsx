"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import {
  Calendar,
  Clock,
  MapPin,
  Trash2,
  Pencil,
  UserPlus,
  CheckCircle,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

type Event = {
  id: number
  name: string
  description: string
  date: string
  start_time: string
  end_time: string
  venue_id?: number
}

type Participant = {
  id: number
  name: string
  email: string
}

export default function EventDetailsPage() {
  const { token, user } = useAuth()
  const { id } = useParams()
  const router = useRouter()

  const [event, setEvent] = useState<Event | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAttendanceMarked, setIsAttendanceMarked] = useState(false)
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false)
  const [formattedDate, setFormattedDate] = useState("")
  const [formattedTime, setFormattedTime] = useState("")

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/events/details/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) throw new Error("Failed to fetch event")
        const data = await res.json()
        setEvent(data)
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load event details.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    const fetchParticipants = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/events/participant_list/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) throw new Error("Failed to fetch participants")
        const data = await res.json()
        setParticipants(data)
      } catch (err) {
        toast({
          title: "Error",
          description: "Could not load participant list.",
          variant: "destructive",
        })
      }
    }

    if (token) {
      fetchEvent()
      fetchParticipants()
    }
  }, [id, token])

  useEffect(() => {
    if (event) {
      try {
        const parsedDate = parseISO(event.date)
        setFormattedDate(format(parsedDate, "PPP"))

        const start = format(parseISO(`${event.date}T${event.start_time}`), "p")
        const end = format(parseISO(`${event.date}T${event.end_time}`), "p")
        setFormattedTime(`${start} - ${end}`)
      } catch (error) {
        console.error("Date formatting error:", error)
        setFormattedTime("Invalid time")
      }
    }
  }, [event])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/events/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error("Delete failed")

      toast({
        title: "Event Deleted",
        description: "The event has been successfully deleted.",
      })
      router.push("/events")
    } catch (err) {
      toast({
        title: "Delete Failed",
        description: "Could not delete event. Try again later.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRegister = async (type: "participant" | "volunteer") => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/events/register_${type}/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error(`Registration as ${type} failed`)

      toast({
        title: `Registered as ${type === "participant" ? "Participant" : "Volunteer"}`,
        description: `You have been successfully registered as a ${type}.`,
      })
    } catch (err) {
      toast({
        title: "Registration Failed",
        description: `Could not register as ${type}.`,
        variant: "destructive",
      })
    }
  }

  const handleMarkAttendance = async () => {
    if (!token || !user?.id) return
    setIsMarkingAttendance(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/events/${id}/attendance/${user.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error("Attendance marking failed")

      toast({
        title: "Attendance Marked",
        description: "Your attendance has been recorded successfully.",
      })
      setIsAttendanceMarked(true)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to mark attendance.",
        variant: "destructive",
      })
    } finally {
      setIsMarkingAttendance(false)
    }
  }

  const handleIndividualAttendance = async (userId: number) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/events/${id}/attendance/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error("Failed to mark attendance")

      toast({
        title: "Success",
        description: `Attendance marked for user ID: ${userId}`,
      })
    } catch (err) {
      toast({
        title: "Error",
        description: `Could not mark attendance for user ID: ${userId}`,
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    )
  }

  if (!event) {
    return <p>Event not found</p>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{event.name}</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/events/${event.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Event?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action is irreversible. The event will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-white"
                >
                  {isDeleting ? "Deleting..." : "Confirm Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            {formattedDate}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="mr-2 h-4 w-4" />
            {formattedTime}
          </div>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            Venue ID: {event.venue_id ?? "N/A"}
          </div>
          <p>{event.description}</p>

          <div className="pt-4">
            <div className="flex items-center mb-2 text-muted-foreground">
              <Users className="mr-2 h-4 w-4" />
              <span>Participants ({participants.length})</span>
            </div>
            <ul className="space-y-2 pl-4 text-sm text-muted-foreground">
              {participants.map((p) => (
                <li key={p.id} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{p.name}</span> &mdash; {p.email}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleIndividualAttendance(p.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                    Mark Attendance
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => handleRegister("participant")}
            className="w-full sm:w-auto"
            variant="default"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Register as Participant
          </Button>
          <Button
            onClick={() => handleRegister("volunteer")}
            className="w-full sm:w-auto"
            variant="secondary"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Register as Volunteer
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
