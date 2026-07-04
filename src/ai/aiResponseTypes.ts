export interface AIServiceResponse<T> {
  data: T;
  fromCache: boolean;
}