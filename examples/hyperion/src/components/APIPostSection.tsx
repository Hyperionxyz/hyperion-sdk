"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { BookCheck, LoaderCircle, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { APILabel } from "./APILabel";
import { CodeArea } from "./CodeArea";
import ParamInSection from "./ParamInSection";
import { Button } from "./ui/button";

export default function APIPostSection({
  api,
  apiParams,
  label,
  description,
  docUrl,
}: {
  label: string;
  api: (params?: any) => any;
  apiParams?: any;
  description?: string;
  docUrl?: string;
}) {
  const [data, setData] = useState<any>(null);
  const [localParams, setLocalParams] = useState(apiParams);
  const [loading, setLoading] = useState<boolean>(false);
  const { signAndSubmitTransaction } = useWallet();

  const initialize = async () => {
    setData(await api?.(localParams));
  };

  const signAndSubmit = async () => {
    if (loading) return;

    try {
      setLoading(true);
      await signAndSubmitTransaction({
        data,
      });
      toast.success("Transaction Success!");
    } catch (e: any) {
      toast.error(e.message || e);
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
          <ParamInSection
            apiParams={localParams}
            onParamChange={(params) => setLocalParams(params)}
          />

          <Button variant={"outline"} onClick={initialize}>
            Generate
          </Button>

          {data && (
            <Button variant={"secondary"} size={"icon"} onClick={signAndSubmit}>
              {loading ? <LoaderCircle className='animate-spin' /> : <Upload />}
            </Button>
          )}
        </div>
      </div>

      {description && (
        <div className='text-xs font-semibold leading-1.3'>{description}</div>
      )}

      {<CodeArea data={data} />}
    </div>
  );
}
