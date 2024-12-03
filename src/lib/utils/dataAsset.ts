import { DatasetAssetType, DatasetConnectionType } from 'lib/models/dataset'
import { Layers, LayoutGrid } from 'lucide-react'
import { ReactComponent as Snowflake } from 'lib/icons/snowflake.svg'
import { ReactComponent as DataBricks } from 'lib/icons/databricks.svg'
import { ReactComponent as BigQuery } from 'lib/icons/bigquery.svg'
import { ReactComponent as Tableau } from 'lib/icons/tableau.svg'

export const getDataAssetTypeIcon = (type: DatasetAssetType) => {
  switch (type) {
    case 'dataset':
      return Layers
    case 'report':
      return LayoutGrid
    case 'unknown':
      return LayoutGrid
  }
}

export const getDataAssetConnectionIcon = (
  connectionType: DatasetConnectionType,
) => {
  switch (connectionType) {
    case 'snowflake':
      return Snowflake
    case 'redshift':
      return Layers
    case 'bigquery':
      return BigQuery
    case 'databricks':
      return DataBricks
    case 'tableau':
      return Tableau
    case 'mode':
      return Layers
    case 'unknown':
      return LayoutGrid
  }
}
