'use client';

import Image from 'next/image';

type ProductOptionProps = {
  id: string;
  name: string;
  image: string;
  isSelected: boolean;
  onSelect: () => void;
};

export default function ProductOption({ id, name, image, isSelected, onSelect }: ProductOptionProps) {
  return (
    <div 
      onClick={onSelect}
      className={`
        cursor-pointer rounded-lg overflow-hidden border-2 transition-all
        ${isSelected ? 'border-cherry-pink shadow-md' : 'border-transparent hover:border-gray-300'}
      `}
    >
      <div className="relative h-24 bg-gray-200">
        <Image 
          src={image} 
          alt={name} 
          fill 
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
          <div className="text-white text-xs font-semibold text-center px-1">
            {name}
          </div>
        </div>
      </div>
      <div className="p-2 text-center">
        <h3 className="text-sm font-medium">{name}</h3>
        {isSelected && (
          <div className="mt-1 text-xs text-cherry-pink font-semibold">Selected</div>
        )}
      </div>
    </div>
  );
}
