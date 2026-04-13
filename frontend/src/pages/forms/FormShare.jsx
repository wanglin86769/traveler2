import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import ShareSettings from '@/components/ShareSettings'
import { getForm } from '@/services/formService'

const FormShare = () => {
  const { id } = useParams()

  const { data: formData } = useQuery({
    queryKey: ['form', id],
    queryFn: () => getForm(id),
    enabled: !!id,
  })

  return (
    <ShareSettings 
      type="form" 
      id={id} 
      title={formData?.title} 
      getItem={getForm}
    />
  )
}

export default FormShare