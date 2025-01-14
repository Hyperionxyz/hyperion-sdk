"use client";

import { LoaderCircle } from "lucide-react";
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
}: {
  api: (params?: any) => Promise<any>;
  apiParams?: any;
  label: string;
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
        description: "Yes",
      });
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
            {loading ? <LoaderCircle className='animate-spin' /> : "Go"}
          </Button>
        </div>
      </div>

      {loading ? "Loading..." : <CodeArea data={data} />}
    </div>
  );
}
