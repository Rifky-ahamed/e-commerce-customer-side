"use client";

import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";

const ApiDocPage = () => {
  return (
    <ApiReferenceReact
      configuration={
        {
          spec: {
            url: "/api/doc",
          },
        } as Parameters<typeof ApiReferenceReact>[0]["configuration"]
      }
    />
  );
};

export default ApiDocPage;
