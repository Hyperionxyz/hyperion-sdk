"use client";

import { AptosClient } from "@/lib/utils";
import { Download, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { APILabel } from "./APILabel";
import { CodeArea } from "./CodeArea";
import ParamInSection from "./ParamInSection";
import { Button } from "./ui/button";

export default function APIViewSection({
  api,
  apiParams,
  label,
}: {
  api: (params?: any) => any;
  apiParams?: any;
  label: string;
}) {
  const [data, setData] = useState<any>();
  const [viewData, setViewData] = useState<any>();
  const [loading, setLoading] = useState(false);
  const initialize = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setData(await api?.(apiParams));
    } catch (e: any) {
      toast.error(e.message || e, {});
    } finally {
      setLoading(false);
    }
  };

  const viewHandler = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setViewData(
        await AptosClient.view({
          payload: data,
        })
      );
    } catch (e: any) {
      toast.error(e.message || e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center justify-between gap-2'>
        <APILabel>{label}</APILabel>

        <div className='flex items-center gap-2'>
          <ParamInSection apiParams={apiParams} />

          <Button variant={"outline"} onClick={initialize}>
            Generate
          </Button>

          {data && (
            <Button variant={"secondary"} size={"icon"} onClick={viewHandler}>
              {loading ? (
                <LoaderCircle className='animate-spin' />
              ) : (
                <Download />
              )}
            </Button>
          )}
        </div>
      </div>

      {<CodeArea data={data} />}
      {loading ? "Loading..." : <CodeArea data={viewData} />}
    </div>
  );
}
