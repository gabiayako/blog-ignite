import Image from 'next/image';

export default function Header() {
  return (
    <Image
      src="/images/logo.svg"
      alt="logo"
      width={238}
      height={25}
      objectFit="contain"
    />
  );
}
