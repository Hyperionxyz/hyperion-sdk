"use client";

import { BookCheck, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { APILabel } from "./APILabel";
import { CodeArea } from "./CodeArea";
import ParamInSection from "./ParamInSection";
import { Button } from "./ui/button";

export default function APIGetSection({
  api,
  apiParams,
  label,
  description,
  docUrl,
}: {
  api: (params?: any) => Promise<any>;
  apiParams?: any;
  label: string;
  description?: string;
  docUrl?: string;
}) {
  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState(false);
  const initialize = async () => {
    if (loading) return;

    console.log(apiParams);
    try {
      setLoading(true);
      setData(await api?.(apiParams));
      toast.success("Success");
    } catch (e: any) {
      toast.error(e.message || e, {
        description: "",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col gap-2 hover:bg-black/10 p-2 rounded-md transition-all'>
      <div className='flex items-center justify-between gap-2'>
        <APILabel>
          {label}
          {docUrl && (
            <a href={docUrl} target='_blank' className='text-green-700'>
              <BookCheck size={14} />
            </a>
          )}
        </APILabel>
        <div className='flex items-center gap-2'>
          <ParamInSection apiParams={apiParams} />

          <Button variant={"outline"} onClick={initialize}>
            {loading ? <LoaderCircle className='animate-spin' /> : "Go"}
          </Button>
        </div>
      </div>

      {description && (
        <div className='text-xs font-semibold leading-1.3'>{description}</div>
      )}

      {loading ? "Loading..." : <CodeArea data={data} />}
    </div>
  );
}
