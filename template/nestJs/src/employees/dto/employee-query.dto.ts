export interface EmployeeSearchFilter {
  field?: string;
  values?: Array<string | number>;
  start?: string;
  end?: string;
}

export interface EmployeeSearchInfo {
  keyword?: string;
  filters?: EmployeeSearchFilter[];
}

export interface EmployeeQueryBody {
  pageIndex?: number | string;
  pageSize?: number | string;
  searchInfo?: EmployeeSearchInfo;
}
