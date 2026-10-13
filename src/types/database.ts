export type DatabaseEngine = 
  | 'FINACLE_CBS'
  | 'ORACLE_FLEXCUBE'
  | 'TEMENOS_TRANSACT'
  | 'POSTGRESQL_CBS'
  | 'REST_API_GATEWAY'
  | 'CUSTOM_ODBC';

export interface BankingDatabaseConfig {
  engine: DatabaseEngine;
  host: string;
  port: number;
  databaseName: string;
  schema: string;
  username: string;
  useSsl: boolean;
  status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'ERROR';
  latencyMs: number;
  lastSyncTimestamp: string;
  totalRecordsInDb: number;
  readOnlyRole: string;
  environment: 'PRODUCTION' | 'STAGING_REPLICA' | 'DISASTER_RECOVERY';
  autoSyncIntervalMinutes: number;
  customFilterSql?: string;
}

export interface DatabaseSyncResult {
  success: boolean;
  timestamp: string;
  recordsCount: number;
  message: string;
  newRecordsFound?: number;
}
