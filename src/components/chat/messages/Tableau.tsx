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
  return (
    <div className='h-fit w-full'>
      <tableau-viz id='tableauViz' src={url} hide-tabs></tableau-viz>
    </div>
  )
}

export default Tableau
