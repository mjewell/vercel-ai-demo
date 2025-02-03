import "@/lib/env/load";
import { env } from "@/lib/env";

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore-error -- this file is generated and might not exist yet
import tests from "../tmp/test-list.json";

async function upload() {
  // @ts-ignore-error -- this file is generated and might not exist yet
  const normalizedTests = tests.map((test) => {
    return {
      name: test.name,
      file: test.file.split("/").slice(3).join("/"),
    };
  });

  const res = await fetch(
    `http://localhost:${env.PORT}/api/test-descriptions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(normalizedTests),
    }
  );

  const data = await res.json();
  console.log(data);
}

upload();
