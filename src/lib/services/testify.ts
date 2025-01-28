import { DeepPartial } from "utility-types";

function isFunction(x: unknown): x is (...args: unknown[]) => unknown {
  return typeof x === "function";
}

function isPlainObject(x: unknown): x is object {
  return (
    typeof x === "object" &&
    x !== null &&
    !Array.isArray(x) &&
    !(x instanceof Date)
  );
}

export const required = Symbol("__required__");

const mergeable = Symbol("__mergeable__");

export function merge<T>(obj: T) {
  if (typeof obj === "function") {
    (obj as typeof obj & { [mergeable]: true })[mergeable] = true;
    return obj;
  }

  return {
    ...obj,
    [mergeable]: true,
  };
}

type Params<Props, Options> =
  | Props
  | ParamsObject<Props, Options>
  | ParamsFunc<Props, Options>
  | typeof required;

type ParamsObject<Props, Options> = {
  [K in keyof Props]?: Params<Props[K], Options>;
};

type ParamsFunc<Props, Options> = (
  overrides: DeepPartial<Props> | undefined,
  options: Options | undefined
) => ParamsObject<Props, Options> | Promise<ParamsObject<Props, Options>>;

async function evaluate<T, A extends unknown[]>(
  valueOrFunction: T | ((...args: A) => T),
  ...args: A
) {
  return isFunction(valueOrFunction)
    ? await (valueOrFunction as (...args: A) => T)(...args)
    : (valueOrFunction as T);
}

async function evaluateAttrs<Props, Options>(
  defaultParamsOrFunc: Params<Props, Options>,
  overrides: DeepPartial<Props> | undefined,
  options: Options | undefined,
  path: string[]
): Promise<Props> {
  if (overrides) {
    if (!isPlainObject(overrides)) {
      return overrides as Props;
    }

    if (
      !defaultParamsOrFunc ||
      !(defaultParamsOrFunc as { [mergeable]?: boolean })[mergeable]
    ) {
      return overrides as Props;
    }
  }

  const defaultParams = await evaluate(defaultParamsOrFunc, overrides, options);

  const resolvedPath = path.join(".");

  if (defaultParams === required) {
    throw new Error(`parameter '${resolvedPath}' is required`);
  }

  if (!isPlainObject(defaultParams)) {
    if (overrides) {
      throw new Error(
        `Object overrides provided for non-object parameter at ${resolvedPath}`
      );
    }
    return defaultParams;
  }

  const attrs = {} as Props;

  const keys = Object.keys({
    ...defaultParams,
    ...overrides,
  }) as (keyof Props)[];

  for (const key of keys) {
    attrs[key] = await evaluateAttrs(
      defaultParams[key] as Props[keyof Props],
      overrides?.[key] as DeepPartial<Props[keyof Props]> | undefined,
      options,
      [...path, key as string]
    );
  }

  return attrs;
}

function testifyBase<Options = never>() {
  return <Props, Result>(
    func: (props: Props) => Result,
    defaultParams: Params<Props, Options>
  ) => {
    return async (overrides?: DeepPartial<Props>, options?: Options) => {
      const attrs = await evaluateAttrs(
        merge(defaultParams),
        overrides,
        options,
        [`${func.name}`]
      );
      return func(attrs);
    };
  };
}

type Testify = ReturnType<typeof testifyBase> & {
  opts: typeof testifyBase;
  merge: typeof merge;
  required: typeof required;
};

export const testify = testifyBase() as Testify;
testify.opts = testifyBase;
testify.merge = merge;
testify.required = required;
