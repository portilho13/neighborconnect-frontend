"use client"

import ListingDetail from "../../../../components/listing-details"

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  return <ListingDetail params={params} />
}
