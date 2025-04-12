"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

type Venue = {
  name: string
  location: string
  capacity: number
}

export default function VenueDetailsPage() {
  const { token, user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [venue, setVenue] = useState<Venue | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const venueId = params.id as string

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/venues/${venueId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) throw new Error("Failed to fetch venue")

        const data = await res.json()
        setVenue(data)
      } catch (err) {
        setError("Unable to load venue details.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchVenue()
  }, [venueId, token])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/venues/delete/${venueId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error("Failed to delete venue")

      toast({
        title: "Venue deleted",
        description: "The venue has been successfully removed.",
      })

      router.push("/venues")
    } catch (err) {
      toast({
        title: "Delete failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) return <p>Loading...</p>
  if (error || !venue)
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || "Venue not found."}</p>
        <Button asChild className="mt-4">
          <Link href="/venues">Back to Venues</Link>
        </Button>
      </div>
    )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{venue.name}</h1>
          <p className="text-muted-foreground">{venue.location}</p>
        </div>

          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/venues/${venueId}/edit`}>Edit</Link>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the venue.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-white"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Capacity</h3>
          <p>{venue.capacity} people</p>
        </div>
        <div>
          <h3 className="font-semibold">Location</h3>
          <p>{venue.location}</p>
        </div>
      </div>
    </div>
  )
}
