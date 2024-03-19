import { fetchThreadById } from "@/lib/actions/thread.action";
import React from "react";

const ParentDisplay = async ({ id }: any) => {
  const parent = await fetchThreadById(id);

  if(!parent) return null;

  const truncateText = (text: any, maxWords:number) => {
    const words = text.split(' ');
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(' ') + '...';
    }
    return text;
  };

  return (
    <div className="w-full max-h-[100%]">
      <p className="!text-small-regular text-light-1 text-ellipsis">{truncateText(parent?.text, 10)}</p>
    </div>
  );
};

export default ParentDisplay;
