import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import ShareSettings from '@/components/ShareSettings'
import { getTraveler } from '@/services/travelerService'

const TravelerShare = () => {
  const { id } = useParams()

  const { data: travelerData } = useQuery({
    queryKey: ['traveler', id],
    queryFn: () => getTraveler(id),
    enabled: !!id,
  })

  return (
    <ShareSettings 
      type="traveler" 
      id={id} 
      title={travelerData?.title} 
      getItem={getTraveler}
    />
  )
}

export default TravelerShare