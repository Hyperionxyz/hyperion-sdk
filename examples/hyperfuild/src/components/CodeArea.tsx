"use client";
import { lazy, useState } from "react";
import { Button } from "./ui/button";

const LazyReactJson = lazy(() => import("react-json-view"));
export function CodeArea({ data }: { data: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    data && (
      <div className='relative w-full'>
        <div className='mb-2'>
          <Button onClick={() => setExpanded(!expanded)}>
            {!expanded ? "Expand" : "Collapse"}
          </Button>
        </div>
        <div
          className={`${expanded ? "h-fit" : "max-h-80"} overflow-y-scroll bg-black/10 rounded-lg p-2 text-xs relative`}
        >
          <LazyReactJson
            src={data}
            displayDataTypes={false}
            displayObjectSize={false}
            theme='monokai'
            indentWidth={4}
            collapsed={false}
            name={false}
          />
        </div>
      </div>
    )
  );
}
