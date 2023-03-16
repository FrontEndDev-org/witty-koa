import { ControllerPrototype, RouterOption } from './type.mjs';
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
    option.params = prototype.routerOptionMap[name].params!.concat(
      option.params
    );
    Object.assign(prototype.routerOptionMap[name], option);
  }
}

function commonMethodGen(path = '', method: Method): MethodDecorator {
  return function (prototype: ControllerPrototype, propertyKey, descriptor) {
    setRouterOptionMap(prototype, propertyKey as string, {
      path: path,
      method,
      cb: descriptor.value as (...args: unknown[]) => Promise<unknown>,
    });
  } as MethodDecorator;
}

export function Get(path = ''): MethodDecorator {
  return commonMethodGen(path, Method.GET);
}

export function Post(path = ''): MethodDecorator {
  return commonMethodGen(path, Method.POST);
}

export function Put(path = ''): MethodDecorator {
  return commonMethodGen(path, Method.PUT);
}
export function Delete(path = ''): MethodDecorator {
  return commonMethodGen(path, Method.DELETE);
}

export function Options(path = ''): MethodDecorator {
  return commonMethodGen(path, Method.OPTIONS);
}

export function Patch(path = ''): MethodDecorator {
  return commonMethodGen(path, Method.PATCH);
}

export function Head(path = ''): MethodDecorator {
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

export function Mongodb(): ParameterDecorator {
  return commonParamGen('', ParamType.MONGODB);
}
