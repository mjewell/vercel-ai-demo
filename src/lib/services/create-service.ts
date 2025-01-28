import { HTTPException } from "hono/http-exception";
import { z } from "zod";

type ServiceDef<Params extends z.ZodObject<z.ZodRawShape>, ReturnType> = {
  params: Params;
  handler: (params: z.infer<Params>) => ReturnType;
};

export function createService<
  Params extends z.ZodObject<z.ZodRawShape>,
  ReturnType
>(serviceDef: ServiceDef<Params, ReturnType>) {
  const service = (params: Parameters<(typeof serviceDef)["handler"]>[0]) => {
    const parseResult = serviceDef.params.safeParse(params);

    if (!parseResult.success) {
      throw new HTTPException(400, {
        message: JSON.stringify(parseResult.error.flatten()),
        cause: parseResult.error,
      });
    }

    return serviceDef.handler(parseResult.data);
  };

  service.params = serviceDef.params;

  return service;
}
