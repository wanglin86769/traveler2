import { Box } from '@mui/material'

const RichTextViewer = ({ content = '', sx = {} }) => {
  if (!content) {
    return null
  }

  return (
    <Box
      sx={{
        '& p': { my: 1 },
        '& h1, & h2, & h3, & h4, & h5, & h6': { mt: 2, mb: 1, fontWeight: 600 },
        '& ul, & ol': { pl: 3 },
        '& li': { my: 0.5 },
        '& a': { color: 'primary.main' },
        '& img': { maxWidth: '100%', height: 'auto' },
        '& table': { borderCollapse: 'collapse', width: '100%', my: 2 },
        '& th, & td': { border: '1px solid #ddd', p: 1 },
        '& th': { bgcolor: 'grey.100' },
        '& code': { bgcolor: 'grey.100', px: 0.5, py: 0.25, borderRadius: 0.5, fontFamily: 'monospace' },
        '& pre': { bgcolor: 'grey.100', p: 2, borderRadius: 1, overflow: 'auto' },
        '& blockquote': { borderLeft: '4px solid', borderColor: 'primary.main', pl: 2, ml: 0, fontStyle: 'italic' },
        ...sx
      }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}

export default RichTextViewer
