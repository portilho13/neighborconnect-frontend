import ListingDetail from '../../../../components/listing-details';

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <ListingDetail id={id} />;
}
