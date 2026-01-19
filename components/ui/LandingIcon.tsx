import Image from 'next/image'

export function LandingIcon() {
  return (
    <div className="flex items-center justify-center mb-8">
      <Image src="/favicon.svg" alt="Library Icon" width={64} height={64} />
    </div>
  )
}
