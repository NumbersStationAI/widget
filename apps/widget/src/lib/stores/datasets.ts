import { create } from 'zustand'

import {
  type DataAssetApi,
  DataAssetTypeApi,
  getDataAssetsForAccount,
} from '@ns/public-api'

import { getAccount } from './user'

type DatasetStore = {
  datasets: DataAssetApi[]
  datasetsLoading: boolean
  fetchDataAssets: () => void
}

export const useDatasetStore = create<DatasetStore>()((set) => ({
  datasets: [],
  datasetsLoading: false,
  fetchDataAssets: async () => {
    set({ datasetsLoading: true })
    try {
      const data = await getDataAssetsForAccount({ accountName: getAccount() })
      set({
        datasets: data.data.filter(
          (d) => d.asset_type === DataAssetTypeApi.dataset,
        ),
      })
    } catch (e: any) {
      console.error('Failed to fetch datasets:', e.message)
    }
    set({ datasetsLoading: false })
  },
}))
