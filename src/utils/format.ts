function arrayToString<T>(arr: T[], length = 5) {
  const count = arr.length - length;
  return count > 0
    ? `[${[...arr.slice(0, length), `<${count} items>`].join(",")}]`
    : `[${arr.slice(0, length).join(",")}]`;
}

export function formatResponse<T>(obj: T, length = 5) {
  if (typeof obj === "object" && obj !== null) {
    const newObj: Record<string, unknown> = {};
    for (const key in obj) {
      newObj[key] =
        key === "embedding" && Array.isArray(obj[key])
          ? arrayToString(obj[key], length)
          : formatResponse(obj[key], length);
    }
    return newObj;
  }

  return obj;
}
