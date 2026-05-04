export type IGenericResponse<T> = {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: T;
};
