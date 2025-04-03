"use client";
import { useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
export default function ParamInSection({ apiParams }: { apiParams: any }) {
  const contentHandler = useCallback((value: any): string | Array<any> => {
    const v: string = value?.trim();
    if (v.includes(",")) {
      return v.split(",").map((v: any) => {
        return contentHandler(v);
      });
    }
    return v;
  }, []);

  return (
    apiParams && (
      <Popover>
        <PopoverTrigger asChild>
          <Button>Params</Button>
        </PopoverTrigger>
        <PopoverContent className='w-[400px]'>
          <div className='flex gap-2 w-full flex flex-col gap-2'>
            {Object.keys(apiParams).map((key: string) => (
              <div className='flex flex-col gap-1 w-full' key={key}>
                <Label className='font-semibold' htmlFor={key}>
                  {key}:
                </Label>
                <Input
                  id={key}
                  defaultValue={apiParams[key]}
                  onChange={(e) => {
                    apiParams[key] = contentHandler(e.target.value);
                  }}
                  className='h-8'
                />
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    )
  );
}
