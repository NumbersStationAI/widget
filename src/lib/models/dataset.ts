export interface Dataset {
  id: string
  name: string
  description: any
  asset_type: string
  connection_type: string
}

export type DatasetConnectionType =
  | 'snowflake'
  | 'redshift'
  | 'bigquery'
  | 'databricks'
  | 'tableau'
  | 'mode'
  | 'unknown'
export type DatasetAssetType = 'dataset' | 'report' | 'unknown'
