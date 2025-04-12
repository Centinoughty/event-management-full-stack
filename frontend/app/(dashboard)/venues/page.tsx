"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Search, Plus } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

type Venue = {
  id: string
  name: string
  address: string
  capacity: number
  facilities: string[]
  contactInfo: string
}

export default function VenuesPage() {
  const { token, user } = useAuth()
  const [venues, setVenues] = useState<Venue[]>([])
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!token) return

    const fetchVenues = async () => {
      try {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL
        const response = await fetch(`${BACKEND_URL}/api/venues/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(await response.text())
        }

        const data = await response.json()
        setVenues(data)
        setFilteredVenues(data)
      } catch (err: any) {
        console.error("Error fetching venues:", err)
        setError("Failed to load venues. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchVenues()
  }, [token])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = venues.filter((venue) =>
        [venue.name, venue.address].some((field) =>
          field.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
      setFilteredVenues(filtered)
    } else {
      setFilteredVenues(venues)
    }
  }, [venues, searchQuery])

  const canCreateVenue = user?.role === "admin" || user?.role === "manager"

  return (
    <div className="space-y-6">
      {/* Header with Create Venue Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Venues</h1>
          <p className="text-muted-foreground">Browse and manage event venues</p>
        </div>
      
          <Button asChild className="mt-4 md:mt-0">
            <Link href="/venues/create">
              <Plus className="mr-2 h-4 w-4" /> Create Venue
            </Link>
          </Button>
      
      </div>

      {/* Search Field */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search venues..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        // Error State
        <div>
          <p className="text-destructive">{error}</p>
        </div>
      ) : filteredVenues.length === 0 ? (
        // Empty State
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-medium">No venues found</h3>
          <p className="text-muted-foreground mt-1">
            {searchQuery ? "Try adjusting your search criteria" : "No venues have been added yet"}
          </p>
          {canCreateVenue && (
            <Button asChild className="mt-4">
              <Link href="/venues/create/page">
                <Plus className="mr-2 h-4 w-4" /> Create Venue
              </Link>
            </Button>
          )}
        </div>
      ) : (
        // Venue List
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredVenues.map((venue) => (
            <Card key={venue.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-1">{venue.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <MapPin className="mr-1 h-4 w-4" />
                  <span className="line-clamp-1">{venue.address}</span>
                </div>
                <div className="text-sm mb-4">Capacity: {venue.capacity} people</div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {(venue.facilities || []).map((facility, i) => (
                    <Badge key={`${venue.id}-facility-${i}`} variant="outline">
                      {facility}
                    </Badge>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/venues/${venue.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
