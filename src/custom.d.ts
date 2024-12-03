declare module '*.svg' {
  import React = require('react')
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>
  const src: string
  export default src
}

declare module 'tableau-react' {
  export interface Props {
    url?: string
    options: any
  }

  export default class TableauReport extends React.Component<Props> {}
}
