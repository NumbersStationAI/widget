interface Props {
  className?: string
  size?: string
}

const Spinner: React.FC<Props> = ({ className, size = '48' }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox={`0 0 48 48`}
    >
      <rect
        x='2'
        y='2'
        height='75%'
        width='75%'
        rx='14'
        ry='14'
        strokeWidth='4'
        strokeLinecap='round'
        strokeLinejoin='round'
        stroke='currentColor'
        className='animate-spinner fill-transparent [stroke-dasharray:30,90]'
      />
      <rect
        x='2'
        y='2'
        height='75%'
        width='75%'
        rx='14'
        ry='14'
        strokeWidth='4'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='fill-transparent stroke-primary/10'
      />
    </svg>
  )
}

export default Spinner
