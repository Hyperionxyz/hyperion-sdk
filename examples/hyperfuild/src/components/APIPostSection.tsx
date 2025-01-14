"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { LoaderCircle, Upload } from "lucide-react";
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
}: {
  api: (params?: any) => any;
  apiParams?: any;
  label: string;
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { signAndSubmitTransaction } = useWallet();

  const initialize = async () => {
    setData(await api?.(apiParams));
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
    <div className='flex flex-col gap-2'>
      <div className='flex items-center justify-between gap-2'>
        <APILabel>{label}</APILabel>

        <div className='flex items-center gap-2'>
          <ParamInSection apiParams={apiParams} />

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

      {<CodeArea data={data} />}
    </div>
  );
}
