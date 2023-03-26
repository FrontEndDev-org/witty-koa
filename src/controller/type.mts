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
  type: ValidateType;
  [ValidateType.REQUIRED]?: ValidateTypeDetail<boolean>;
  [ValidateType.REG]?: ValidateTypeDetail<RegExp>;
  [ValidateType.NUMBER]?: ValidateTypeDetail<ValidateNumberOptions>;
  message?: string;
}

export interface ValidateNumberOptions {
  range: [number, number];
}

export enum ValidateType {
  REQUIRED = 'required',
  REG = 'reg',
  NUMBER = 'number',
}

export interface ValidateTypeDetail<T> {
  value?: T;
  path?: string;
}

export interface ControllerInterface {
  [name: string]: (...args: unknown[]) => Promise<unknown>;
}
