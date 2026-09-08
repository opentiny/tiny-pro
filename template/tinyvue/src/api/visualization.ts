import type { GeneralChart } from '@/types/global'
import axios from 'axios'

export interface ChartDataRecord {
  x: string
  y: number
  name: string
}
export interface DataChainGrowth {
  quota: string
}

export interface DataChainGrowthRes {
  count: number
  growth: number
  chartData: {
    xAxis: string[]
    data: { name: string, value: number[] }
  }
}
export function queryDataChainGrowth(data: DataChainGrowth) {
  return axios.post<DataChainGrowthRes>(`/data-chain-growth`, data)
}

export interface PopularAuthorRes {
  list: {
    ranking: number
    author: string
    contentCount: number
    clickCount: number
  }[]
}

export function queryPopularAuthor() {
  return axios.get<PopularAuthorRes>(`/popular-author/list`)
}

export interface ContentPublishRecord {
  x: string[]
  y: number[]
  name: string
}

export function queryContentPublish() {
  return axios.get<ContentPublishRecord[]>(`/content-publish`)
}

export function queryContentPeriodAnalysis() {
  return axios.post<GeneralChart>(`/content-period-analysis`)
}

export interface PublicOpinionAnalysis {
  quota: string
}
export interface PublicOpinionAnalysisRes {
  count: number
  growth: number
  chartData: ChartDataRecord[]
}
export function queryPublicOpinionAnalysis(data: DataChainGrowth) {
  return axios.post<PublicOpinionAnalysisRes>(
    `/public-opinion-analysis`,
    data,
  )
}
export interface DataOverviewRes {
  xAxis: string[]
  data: Array<{ name: string, value: number[], count: number }>
}

export function queryDataOverview() {
  return axios.post<DataOverviewRes>(`/data-overview`)
}
