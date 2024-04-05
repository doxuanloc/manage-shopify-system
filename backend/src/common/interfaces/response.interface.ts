export interface IResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

export interface IPaginationResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    totalPage: number;
  };
}
