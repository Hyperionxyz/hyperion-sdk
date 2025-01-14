"use client";

export function APILabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className='px-3 py-2 rounded-md bg-black/30 font-semibold w-fit text-sm'>
      {children}
    </h3>
  );
}
