export type IPaginationMeta = {
  itemCount: number;
  totalItems?: number;
  itemsPerPage: number;
  totalPages?: number;
  currentPage: number;
};

export type InputFilterValue = {
  text: string;
  relation: 'equals' | 'contains' | 'startwith';
};

export type FilterType = {
  [key: string]: {
    type: string;
    value: InputFilterValue | number[];
  };
};

export type Pager = {
  currentPage: number;
  pageSizes: number[];
  layout: string;
  total: number;
  pageSize: number;
};

export interface AnyObject {
  [key: string]: unknown;
}

export interface Options {
  value: unknown;
  label: string;
}

export interface NodeOptions extends Options {
  children?: NodeOptions[];
}

export interface GetParams {
  body: null;
  type: string;
  url: string;
}

export interface PostData {
  body: string;
  type: string;
  url: string;
}

export interface Pagination {
  current: number;
  pageSize: number;
  total?: number;
}

export type TimeRanger = [string, string];

export interface GeneralChart {
  xAxis: string[];
  data: Array<{ name: string; value: number[] }>;
}

export interface ApigInfo {
  apigName: string;
  apigGroupName: string;
}

export type CommonError = {
  message: string;
};
