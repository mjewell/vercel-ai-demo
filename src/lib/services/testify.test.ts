import { faker } from "@faker-js/faker";
import { testify } from "./testify";

describe("primitive property", () => {
  type Props = {
    prop: string;
  };

  function toBeFaked(props: Props) {
    return props.prop;
  }

  it("can be defined statically", async () => {
    const randomWord = faker.word.noun();

    const faked = testify(toBeFaked, {
      prop: randomWord,
    });

    expect(await faked({})).toBe(randomWord);
    expect(await faked({ prop: "override" })).toBe("override");
  });

  it("can be defined as a synchronous function", async () => {
    const randomWord = faker.word.noun();

    const faked = testify(toBeFaked, {
      prop: () => randomWord,
    });

    expect(await faked({})).toBe(randomWord);
    expect(await faked({ prop: "override" })).toBe("override");
  });

  it("can be defined as an asynchronous function", async () => {
    const randomWord = faker.word.noun();

    const faked = testify(toBeFaked, {
      prop: async () => randomWord,
    });

    expect(await faked({})).toBe(randomWord);
    expect(await faked({ prop: "override" })).toBe("override");
  });

  it("can be configured with options", async () => {
    const randomWord = faker.word.noun();

    const faked = testify.opts<"foo" | "bar">()(toBeFaked, {
      prop: (_, opts) => (opts === "foo" ? "foo" : randomWord),
    });

    expect(await faked({})).toBe(randomWord);
    expect(await faked({}, "foo")).toBe("foo");
    expect(await faked({ prop: "whatever" }, "foo")).toBe("whatever");
  });
});

describe("object property", () => {
  type Props = {
    prop: {
      a: string;
      b: number;
    };
  };

  function toBeFaked(props: Props) {
    return props.prop;
  }

  it("can be defined statically", async () => {
    const randomWord = faker.word.noun();

    const faked = testify(toBeFaked, {
      prop: { a: randomWord, b: 10 },
    });

    expect(await faked({})).toEqual({ a: randomWord, b: 10 });
    expect(await faked({ prop: { a: "override" } })).toEqual({
      a: "override",
    });
    expect(await faked({ prop: { a: "override", b: 20 } })).toEqual({
      a: "override",
      b: 20,
    });
  });

  it("can be defined as a synchronous function", async () => {
    const randomWord = faker.word.noun();

    const faked = testify(toBeFaked, {
      prop: () => ({ a: randomWord, b: 10 }),
    });

    expect(await faked({})).toEqual({ a: randomWord, b: 10 });
    expect(await faked({ prop: { a: "override" } })).toEqual({
      a: "override",
    });
    expect(await faked({ prop: { a: "override", b: 20 } })).toEqual({
      a: "override",
      b: 20,
    });
  });

  it("can be defined as an asynchronous function", async () => {
    const randomWord = faker.word.noun();

    const faked = testify(toBeFaked, {
      prop: async () => ({ a: randomWord, b: 10 }),
    });

    expect(await faked({})).toEqual({ a: randomWord, b: 10 });
    expect(await faked({ prop: { a: "override" } })).toEqual({
      a: "override",
    });
    expect(await faked({ prop: { a: "override", b: 20 } })).toEqual({
      a: "override",
      b: 20,
    });
  });

  it("can be defined as nested functions", async () => {
    const randomWord = faker.word.noun();

    const faked = testify(toBeFaked, {
      prop: () => ({ a: () => randomWord, b: 10 }),
    });

    expect(await faked({})).toEqual({ a: randomWord, b: 10 });
    expect(await faked({ prop: { a: "override" } })).toEqual({
      a: "override",
    });
    expect(await faked({ prop: { a: "override", b: 20 } })).toEqual({
      a: "override",
      b: 20,
    });
  });

  it("can be configured with options", async () => {
    const randomWord = faker.word.noun();

    const faked = testify.opts<"foo" | "bar">()(toBeFaked, {
      prop: (val, opts) =>
        val ?? { a: opts === "foo" ? "foo" : randomWord, b: 10 },
    });

    expect(await faked({})).toEqual({ a: randomWord, b: 10 });
    expect(await faked({ prop: { a: "override" } })).toEqual({
      a: "override",
    });
    expect(await faked({ prop: { a: "override", b: 20 } })).toEqual({
      a: "override",
      b: 20,
    });
    expect(await faked({}, "foo")).toEqual({ a: "foo", b: 10 });
    expect(await faked({ prop: { a: "override" } }, "foo")).toEqual({
      a: "override",
    });
    expect(await faked({ prop: { a: "override", b: 20 } }, "foo")).toEqual({
      a: "override",
      b: 20,
    });
  });
});

describe("required", () => {
  type Props = {
    a: string;
    b: number;
  };

  function toBeFaked(props: Props) {
    return props;
  }

  it("errors if you dont provide the required property", async () => {
    const randomWord = faker.word.noun();

    const faked = testify(toBeFaked, {
      a: randomWord,
      b: testify.required,
    });

    await expect(faked({})).rejects.toThrow(
      "parameter 'toBeFaked.b' is required"
    );
    await expect(faked({ a: "whatever" })).rejects.toThrow(
      "parameter 'toBeFaked.b' is required"
    );
    expect(await faked({ b: 10 })).toEqual({ a: randomWord, b: 10 });
  });
});

describe("merge", () => {
  type Props = {
    prop: {
      a: string;
      b: number;
    };
  };

  function toBeFaked(props: Props) {
    return props.prop;
  }

  it("merges overrides into parameters that are tagged as merge", async () => {
    const randomWord = faker.word.noun();

    const faked = testify(toBeFaked, {
      prop: testify.merge({
        a: randomWord,
        b: 10,
      }),
    });

    expect(await faked({ prop: { b: 10 } })).toEqual({ a: randomWord, b: 10 });
    expect(await faked({ prop: { a: "whatever" } })).toEqual({
      a: "whatever",
      b: 10,
    });
    expect(await faked({ prop: { a: "whatever", b: 20 } })).toEqual({
      a: "whatever",
      b: 20,
    });
  });
});
