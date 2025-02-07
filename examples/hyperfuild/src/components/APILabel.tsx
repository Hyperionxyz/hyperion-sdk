"use client";

export function APILabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className='px-3 py-2 rounded-md bg-black/10 font-semibold w-fit text-sm flex items-center gap-2'>
      {children}
    </h3>
  );
}
