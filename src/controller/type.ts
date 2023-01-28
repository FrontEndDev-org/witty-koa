import { Method, ParamType } from './enum';

export interface ControllerPrototype {
  prefix: string;
  routerOptionMap: {
    [name: string]: RouterOption;
  };
}
export interface RouterOption {
  path?: string;
  method?: Method;
  cb?: (...args: unknown[]) => Promise<unknown>;
  params?: RouterParam[];
}

export interface RouterParam {
  index: number;
  type: ParamType;
  param: string;
}

export interface ControllerInterface {
  [name: string]: (...args: unknown[]) => Promise<unknown>;
}
