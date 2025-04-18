import { Layers, LayoutGrid } from 'lucide-react'

import { DataAssetTypeApi } from '@ns/public-api'

export function getDataAssetTypeIcon(type?: DataAssetTypeApi) {
  switch (type) {
    case DataAssetTypeApi.dataset:
      return Layers
    case DataAssetTypeApi.report:
      return LayoutGrid
    default:
      return LayoutGrid
  }
}
