import { Method, ParamType } from './enum.mjs';

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
  type?: ParamType;
  param?: string;
  validates?: Validate[];
}
export interface Validate {
  required?: boolean;
  message?: string;
  reg?: RegExp;
}

export interface ControllerInterface {
  [name: string]: (...args: unknown[]) => Promise<unknown>;
}
