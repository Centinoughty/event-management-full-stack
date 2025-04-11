// app/venues/[id]/edit/page.tsx

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export default function EditVenuePage() {
  const { token } = useAuth()
  const params = useParams()
  const router = useRouter()
  const venueId = params.id as string

  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [capacity, setCapacity] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/venues/${venueId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error("Failed to fetch venue data")

        const data = await res.json()
        setName(data.name || "")
        setLocation(data.location || "")
        setCapacity(data.capacity || 0)
      } catch (err) {
        setError("Failed to load venue")
      } finally {
        setLoading(false)
      }
    }

    fetchVenue()
  }, [venueId, token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch(`${BACKEND_URL}/api/venues/update/${venueId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, location, capacity }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Failed to update venue")
      }

      toast({
        title: "Venue updated",
        description: "The venue has been successfully updated.",
      })
      router.push(`/venues/${venueId}`)
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Try again later.",
        variant: "destructive",
      })
    }
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p className="text-destructive">{error}</p>

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Edit Venue</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Venue Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value))}
            required
          />
        </div>
        <Button type="submit">Update Venue</Button>
      </form>
    </div>
  )
}
