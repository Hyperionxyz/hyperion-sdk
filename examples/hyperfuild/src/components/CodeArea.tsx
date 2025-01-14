"use client";
import ReactJson from "react-json-view";

export function CodeArea({ data }: { data: any }) {
  return (
    data && (
      <div className='max-h-80 overflow-y-scroll bg-black/10 rounded-lg p-2'>
        <ReactJson
          src={data}
          displayDataTypes={false}
          displayObjectSize={false}
          theme='monokai'
          indentWidth={4}
          collapsed={false}
          name={false}
        />
      </div>
    )
  );
}
