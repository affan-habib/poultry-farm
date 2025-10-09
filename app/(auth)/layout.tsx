import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Poultry farm"
          layout="fill"
          objectFit="cover"
          className="grayscale"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-lg">{children}</div>
      </div>
    </div>
  );
}