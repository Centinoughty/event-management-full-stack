"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export default function CreateVenuePage() {
  const { token } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    capacity: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`${BACKEND_URL}/api/venues/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          capacity: parseInt(formData.capacity, 10),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create venue")
      }

      const data = await response.json()

      toast({
        title: "Venue created",
        description: "Your venue has been created successfully",
      })
      router.push(`/venues/${data.id}`)
    } catch (error) {
      toast({
        title: "Error creating venue",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Add Venue</h1>
        <p className="text-muted-foreground">Fill in the details to add a new venue</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Venue Details</CardTitle>
            <CardDescription>Provide the basic information about the venue</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Venue Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter venue name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter venue location"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="Maximum capacity"
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/venues">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Venue"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
