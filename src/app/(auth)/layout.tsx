import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const authBg = PlaceHolderImages.find((img) => img.id === 'auth-bg');

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full">
      {authBg && (
        <Image
          src={authBg.imageUrl}
          alt={authBg.description}
          data-ai-hint={authBg.imageHint}
          fill
          className="absolute inset-0 -z-10 h-full w-full object-cover brightness-50"
        />
      )}
      <div className="flex min-h-screen items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
}
