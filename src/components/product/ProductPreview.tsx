import Image from 'next/image';
import { ProductType } from './ProductBuilder';

type CookieOption = {
  id: string;
  name: string;
  image: string;
} | null;

type IceCreamOption = {
  id: string;
  name: string;
  image: string;
} | null;

type ProductPreviewProps = {
  productType: ProductType;
  bottomCookie: CookieOption;
  iceCream: IceCreamOption;
  topCookie: CookieOption;
};

export default function ProductPreview({ productType, bottomCookie, iceCream, topCookie }: ProductPreviewProps) {
  // Render different preview based on product type
  const renderSandwichPreview = () => (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="relative">
        {/* Top Cookie */}
        <div className="relative h-20 w-full mb-1">
          {topCookie ? (
            <Image
              src={topCookie.image}
              alt={topCookie.name}
              fill
              className="object-contain"
            />
          ) : (
            <div className="h-full bg-gray-200 rounded-full flex items-center justify-center">
              <div className="text-cherry-pink text-center">
                <div className="text-sm font-medium">Select Top Cookie</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Ice Cream */}
        <div className="relative h-52 w-full mb-1">
          {iceCream ? (
            <Image
              src={iceCream.image}
              alt={iceCream.name}
              fill
              className="object-contain"
            />
          ) : (
            <div className="h-full bg-gray-200 rounded-full flex items-center justify-center">
              <div className="text-cherry-pink text-center">
                <div className="text-sm font-medium">Select Ice Cream</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Bottom Cookie */}
        <div className="relative h-20 w-full">
          {bottomCookie ? (
            <Image
              src={bottomCookie.image}
              alt={bottomCookie.name}
              fill
              className="object-contain"
            />
          ) : (
            <div className="h-full bg-gray-200 rounded-full flex items-center justify-center">
              <div className="text-cherry-pink text-center">
                <div className="text-sm font-medium">Select Bottom Cookie</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPookiePreview = () => (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="relative">
        {/* Ice Cream */}
        <div className="relative h-16 w-full mb-1">
          {iceCream ? (
            <Image
              src={iceCream.image}
              alt={iceCream.name}
              fill
              className="object-contain"
            />
          ) : (
            <div className="h-full bg-gray-200 rounded-full flex items-center justify-center">
              <div className="text-cherry-pink text-center">
                <div className="text-sm font-medium">Select Ice Cream</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Cookie Base */}
        <div className="relative h-20 w-full">
          {bottomCookie ? (
            <Image
              src={bottomCookie.image}
              alt={bottomCookie.name}
              fill
              className="object-contain"
            />
          ) : (
            <div className="h-full bg-gray-200 rounded-full flex items-center justify-center">
              <div className="text-cherry-pink text-center">
                <div className="text-sm font-medium">Select Cookie Base</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderIceCreamPreview = () => (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="relative">
        {/* Ice Cream */}
        <div className="relative h-32 w-full">
          {iceCream ? (
            <Image
              src={iceCream.image}
              alt={iceCream.name}
              fill
              className="object-contain"
            />
          ) : (
            <div className="h-full bg-gray-200 rounded-full flex items-center justify-center">
              <div className="text-cherry-pink text-center">
                <div className="text-sm font-medium">Select Ice Cream</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const getProductName = () => {
    switch (productType) {
      case 'sandwich':
        return 'Ice Cream Sandwich';
      case 'pookie':
        return 'Pookie';
      case 'ice-cream':
        return 'Ice Cream';
      default:
        return 'Product';
    }
  };

  const isSelectionComplete = () => {
    switch (productType) {
      case 'sandwich':
        return bottomCookie && iceCream && topCookie;
      case 'pookie':
        return bottomCookie && iceCream;
      case 'ice-cream':
        return iceCream;
      default:
        return false;
    }
  };

  const getSelectionDescription = () => {
    switch (productType) {
      case 'sandwich':
        return topCookie && iceCream && bottomCookie 
          ? `${topCookie.name} + ${iceCream.name} + ${bottomCookie.name}`
          : '';
      case 'pookie':
        return bottomCookie && iceCream
          ? `${iceCream.name} on ${bottomCookie.name}`
          : '';
      case 'ice-cream':
        return iceCream
          ? `${iceCream.name}`
          : '';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col items-center">
      {productType === 'sandwich' && renderSandwichPreview()}
      {productType === 'pookie' && renderPookiePreview()}
      {productType === 'ice-cream' && renderIceCreamPreview()}
      
      <div className="mt-6 text-center">
        {isSelectionComplete() ? (
          <div>
            <h3 className="text-xl font-bold mb-2 text-cherry-pink">Your Custom {getProductName()}</h3>
            <p className="text-columbia-blue">
              {getSelectionDescription()}
            </p>
          </div>
        ) : (
          <p className="text-cherry-pink">
            Select all options to see your custom {getProductName().toLowerCase()}
          </p>
        )}
      </div>
    </div>
  );
}
