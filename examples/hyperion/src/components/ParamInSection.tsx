"use client";
import { useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Switch } from "./ui/switch";
import { Delete, Trash2 } from "lucide-react";
export default function ParamInSection({
  apiParams,
  onParamChange,
}: {
  apiParams: any;
  onParamChange: (params: any) => void;
}) {
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
        <PopoverContent className='w-[580px]'>
          <div className='flex gap-2 w-full flex flex-col gap-2'>
            {Object.keys(apiParams).map((key: string) => (
              <div className='flex flex-col gap-1 w-full' key={key}>
                <Label className='font-semibold' htmlFor={key}>
                  {key}:
                </Label>

                {typeof apiParams[key] === "boolean" && (
                  <Switch
                    id={key}
                    checked={apiParams[key]}
                    onCheckedChange={(checked: boolean) => {
                      onParamChange({
                        ...apiParams,
                        [key]: checked,
                      });
                    }}
                  />
                )}
                {["string", "number"].includes(typeof apiParams[key]) && (
                  <Input
                    id={key}
                    defaultValue={apiParams[key]}
                    onChange={(e) => {
                      onParamChange({
                        ...apiParams,
                        [key]: contentHandler(e.target.value),
                      });
                    }}
                    className='h-8'
                  />
                )}
                {Array.isArray(apiParams[key]) && (
                  <div className='flex flex-col gap-1 mt-1'>
                    {apiParams[key].map((v: any, index: number) => (
                      <div
                        className='text-sm flex items-center group justify-between hover:bg-gray-100 rounded-sm px-1 py-1px'
                        key={index}
                      >
                        {index + 1}. {v}
                        <Trash2
                          size={14}
                          className='ml-2 cursor-pointer hidden group-hover:block hover:text-red-500'
                          onClick={() => {
                            onParamChange({
                              ...apiParams,
                              [key]: apiParams[key].filter(
                                (v: any, i: number) => i !== index
                              ),
                            });
                          }}
                        />
                      </div>
                    ))}
                    <Input
                      placeholder='Add new item! Push Enter to add.'
                      defaultValue={""}
                      onKeyUp={(e: any) => {
                        if (e.keyCode === 13) {
                          onParamChange({
                            ...apiParams,
                            [key]: apiParams[key].concat(e.target.value),
                          });
                          e.target.value = "";
                        }
                      }}
                      className='h-8'
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    )
  );
}
