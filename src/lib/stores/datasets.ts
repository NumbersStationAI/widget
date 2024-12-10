import { Dataset } from 'lib/models/dataset'
import { create } from 'zustand'
import { getAccount } from './user'
import { API_URL } from 'lib/constants'
import { checkResponseError } from 'lib/utils/fetch'

type DatasetStore = {
  datasets: Dataset[]
  datasetsLoading: boolean
  fetchDataAssets: () => void
}

export const useDatasetStore = create<DatasetStore>()((set) => ({
  datasets: [],
  datasetsLoading: false,
  fetchDataAssets: async () => {
    set({ datasetsLoading: true })
    try {
      const response = await fetch(
        `${API_URL}/v3/orgs/${getAccount()}/data_assets/`,
        {
          credentials: 'include',
        },
      )
      checkResponseError(response)
      const data = await response.json()
      set({
        datasets: data.data.filter(
          (dataset: Dataset) => dataset.asset_type === 'dataset',
        ),
      })
    } catch (e: any) {
      // set({ datasets:  });
      console.error('Failed to fetch datasets:', e.message)
    }
    set({ datasetsLoading: false })
  },
}))
