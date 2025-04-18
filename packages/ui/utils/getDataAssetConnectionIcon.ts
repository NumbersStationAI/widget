import { Layers, LayoutGrid } from 'lucide-react'

import { DataAssetConnectionTypeApi } from '@ns/public-api'

import { BigQuery } from '../icons/BigQuery'
import { Databricks } from '../icons/Databricks'
import { Snowflake } from '../icons/Snowflake'
import { Tableau } from '../icons/Tableau'

export function getDataAssetConnectionIcon(
  connectionType?: DataAssetConnectionTypeApi,
) {
  switch (connectionType) {
    case DataAssetConnectionTypeApi.snowflake:
      return Snowflake
    case DataAssetConnectionTypeApi.bigquery:
      return BigQuery
    case DataAssetConnectionTypeApi.databricks:
      return Databricks
    case DataAssetConnectionTypeApi.redshift:
      return Layers
    case DataAssetConnectionTypeApi.tableau:
      return Tableau
    case DataAssetConnectionTypeApi.mode:
      return Layers
    case DataAssetConnectionTypeApi.unknown:
      return LayoutGrid
    default:
      return LayoutGrid
  }
}
