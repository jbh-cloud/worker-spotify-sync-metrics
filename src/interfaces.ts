import Toucan from "toucan-js";

export interface Env {
  METRICS: KVNamespace
  METRICS_ADMIN_APIKEY: string
  METRICS_POST_APIKEY: string
  METRICS_GET_APIKEY: string
  SENTRY_DSN: string
  METRICS_POST_TIME_INVALIDATOR: number
}

export interface SpotifySyncMetricDto {
  machineId: string,
  runType: string,
  runTypeAction: string,
  executionTime: string,
  executionId: string
  configHash: string,
  configMaxBitrate: string,
  configSkipLowQuality: boolean,
  configSpotifyPlaylistsEnabled: boolean,
  configSpotifyPlaylistsOwner: boolean,
  configPushover: boolean,
  configAutoscan: boolean
}


export interface IRequest extends Request {
  isAuthenticated: boolean
  sentry: Toucan
}