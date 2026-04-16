import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import ShareSettings from '@/components/ShareSettings'
import { getBinder } from '@/services/binderService'

const BinderShare = () => {
  const { id } = useParams()

  const { data: binderData } = useQuery({
    queryKey: ['binder', id],
    queryFn: () => getBinder(id),
    enabled: !!id,
  })

  return (
    <ShareSettings 
      type="binder" 
      id={id} 
      title={binderData?.title} 
      getItem={getBinder}
    />
  )
}

export default BinderShare