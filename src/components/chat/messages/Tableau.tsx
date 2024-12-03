import TableauReport from 'tableau-react'
import useSize from '@react-hook/size'
import { HTMLAttributes, useRef } from 'react'

interface TableauProps {
  id?: string
  src: string | undefined
  height?: string | number
  width?: string
  style?: any
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'tableau-viz': TableauProps
    }
  }
}

interface Props {
  url?: string
}
const Tableau: React.FC<Props> = ({ url }) => {
  const target = useRef(null)
  const [width, height] = useSize(target)

  return (
    <div className='h-fit w-full'>
      <tableau-viz id='tableauViz' src={url} hide-tabs></tableau-viz>
    </div>
  )
}

export default Tableau

// <TableauReport
//         options={{
//           hideTabs: true,
//         }}
//         url={url}
//       />
//
