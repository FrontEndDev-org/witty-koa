import {
  ControllerPrototype,
  DataClassPrototype,
  RouterOption,
  ValidateNumberOptions,
  ValidateType,
} from './type.mjs';
import { Method, ParamType } from './enum.mjs';

export function Controller(prefix = ''): ClassDecorator {
  return function (target) {
    const prototype: ControllerPrototype = target.prototype;
    prototype.prefix = prefix;
  };
}

function setRouterOptionMap(
  prototype: ControllerPrototype,
  name: string,
  option: RouterOption
) {
  if (!prototype.routerOptionMap) {
    prototype.routerOptionMap = {};
  }
  if (!prototype.routerOptionMap[name]) {
    prototype.routerOptionMap[name] = option;
  } else {
    if (!option.params) {
      option.params = [];
    }
    if (!prototype.routerOptionMap[name].params) {
      prototype.routerOptionMap[name].params = [];
    }
    for (const param of option.params) {
      const find = prototype.routerOptionMap[name].params!.find(
        (one) => one.index === param.index
      );
      if (find) {
        if (!find.validates || !param.validates) {
          Object.assign(find, param);
        } else {
          find.validates.unshift(...param.validates);
          Object.assign(find, { ...param, validates: find.validates });
        }
      } else {
        prototype.routerOptionMap[name].params!.push(param);
      }
    }
    option.params = prototype.routerOptionMap[name].params;
    Object.assign(prototype.routerOptionMap[name], option);
  }
}

function commonMethodGen(path = '', method: Method): MethodDecorator {
  return function (
    prototype: ControllerPrototype,
    propertyKey,
    descriptor
  ): void {
    setRouterOptionMap(prototype, propertyKey as string, {
      path,
      method,
      cb: descriptor.value as (...args: unknown[]) => Promise<unknown>,
    });
  } as MethodDecorator;
}

export function Get(path = ''): any {
  return commonMethodGen(path, Method.GET);
}

export function Post(path = ''): any {
  return commonMethodGen(path, Method.POST);
}

export function Put(path = ''): any {
  return commonMethodGen(path, Method.PUT);
}
export function Delete(path = ''): any {
  return commonMethodGen(path, Method.DELETE);
}

export function Options(path = ''): any {
  return commonMethodGen(path, Method.OPTIONS);
}

export function Patch(path = ''): any {
  return commonMethodGen(path, Method.PATCH);
}

export function Head(path = ''): any {
  return commonMethodGen(path, Method.HEAD);
}

function commonParamGen(param: string, type: ParamType): ParameterDecorator {
  return function (
    prototype: ControllerPrototype,
    propertyKey,
    parameterIndex
  ) {
    setRouterOptionMap(prototype, propertyKey as string, {
      params: [
        {
          index: parameterIndex,
          param,
          type,
        },
      ],
    });
  } as ParameterDecorator;
}
export function Param(name = ''): ParameterDecorator {
  return commonParamGen(name, ParamType.PARAM);
}
export function Body(name = ''): ParameterDecorator {
  return commonParamGen(name, ParamType.BODY);
}
export function Header(name = ''): ParameterDecorator {
  return commonParamGen(name, ParamType.HEADER);
}
export function Query(name = ''): ParameterDecorator {
  return commonParamGen(name, ParamType.QUERY);
}

export function Required(path?: string, message?: string): ParameterDecorator {
  return function (
    prototype: ControllerPrototype,
    propertyKey,
    parameterIndex
  ) {
    setRouterOptionMap(prototype, propertyKey as string, {
      params: [
        {
          index: parameterIndex,
          validates: [
            {
              type: ValidateType.REQUIRED,
              [ValidateType.REQUIRED]: {
                value: true,
                path,
              },
              message,
            },
          ],
        },
      ],
    });
  } as ParameterDecorator;
}

export function Reg(
  reg: RegExp,
  path?: string,
  message?: string
): ParameterDecorator {
  return function (
    prototype: ControllerPrototype,
    propertyKey,
    parameterIndex
  ) {
    setRouterOptionMap(prototype, propertyKey as string, {
      params: [
        {
          index: parameterIndex,
          validates: [
            {
              type: ValidateType.REG,
              [ValidateType.REG]: {
                value: reg,
                path,
              },
              message,
            },
          ],
        },
      ],
    });
  } as ParameterDecorator;
}

export function IsNumber(
  path?: string,
  options?: ValidateNumberOptions,
  message?: string
): ParameterDecorator {
  return function (
    prototype: ControllerPrototype,
    propertyKey,
    parameterIndex
  ) {
    setRouterOptionMap(prototype, propertyKey as string, {
      params: [
        {
          index: parameterIndex,
          validates: [
            {
              type: ValidateType.NUMBER,
              [ValidateType.NUMBER]: {
                value: options,
                path,
              },
              message,
            },
          ],
        },
      ],
    });
  } as ParameterDecorator;
}
export function Session(key = ''): ParameterDecorator {
  return commonParamGen(key, ParamType.SESSION);
}

export function UserInfo(): ParameterDecorator {
  return commonParamGen('userInfo', ParamType.SESSION);
}

export function Mongodb(): ParameterDecorator {
  return commonParamGen('', ParamType.MONGODB);
}

export function Type(
  // eslint-disable-next-line @typescript-eslint/ban-types
  c: Function,
  isArray?: boolean
): ParameterDecorator & PropertyDecorator {
  return function (prototype, propertyKey, parameterIndex) {
    // 参数上面
    if (parameterIndex !== undefined) {
      const prototype_ = prototype as ControllerPrototype;
      setRouterOptionMap(prototype_, propertyKey as string, {
        params: [
          {
            index: parameterIndex,
            dataType: c,
          },
        ],
      });
    }
    // 属性上面
    else {
      const prototype_ = prototype as DataClassPrototype;
      if (!prototype_.__isDataClass) {
        prototype_.__isDataClass = true;
      }
      if (prototype_.props) {
        prototype_.props = [];
      }
      prototype_.props.push({
        isArray,
        dataType: c,
      });
    }
  } as ParameterDecorator & PropertyDecorator;
}
