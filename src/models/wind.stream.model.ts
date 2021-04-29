export interface HeaderEntity {
  parameterNumberName: string;
  parameterUnit: string;
  parameterNumber: number;
  parameterCategory: number;
  nx: number;
  ny: number;
  numberPoints: number;
  dx: number;
  dy: number;
  la1: number;
  lo1: number;
  la2: number;
  lo2: number;
  refTime: string;
}

export interface WindStream {
  header: HeaderEntity;
  data: number[];
}
