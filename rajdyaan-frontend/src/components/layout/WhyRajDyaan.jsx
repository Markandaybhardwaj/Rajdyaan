// ---------------------------------------------------------------------------
// WhyRajDyaan — Trust Strip
// ---------------------------------------------------------------------------
// 3 trust badges with custom badge images: "100% Pure", "Lab Tested",
// "No Chemicals". Uses Cloudinary-hosted badge PNGs.
// ---------------------------------------------------------------------------
import Image from 'next/image';

export default function WhyRajDyaan() {
  const badges = [
    {
      id: 'pure',
      label: '100% Pure',
      subtitle: 'Straight from the source',
      image: 'https://res.cloudinary.com/dzikgxfxr/image/upload/v1778438256/100_pure_badge_xtfbbz.png',
    },
    {
      id: 'lab-tested',
      label: 'Lab Tested',
      subtitle: 'Third-party verified',
      image: 'https://res.cloudinary.com/dzikgxfxr/image/upload/v1778438279/labtested_badge_lnfk7l.png',
    },
    {
      id: 'no-chemicals',
      label: 'No Chemicals',
      subtitle: 'Zero additives',
      image: 'https://res.cloudinary.com/dzikgxfxr/image/upload/v1778438308/no_chemical_badge_jrmp2c.png',
    },
  ];

  return (
    <section
      id="why-rajdyaan"
      className="border-y border-accent/10 bg-secondary py-10 md:py-14"
    >
      <div className="mx-auto grid max-w-5xl grid-cols-3 gap-4 px-5 md:px-8">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className="flex flex-col items-center text-center"
          >
            <div className="relative mb-3 h-16 w-16 md:h-20 md:w-20">
              <Image
                src={badge.image}
                alt={badge.label}
                fill
                sizes="(max-width: 768px) 64px, 80px"
                className="object-contain"
              />
            </div>
            <h3 className="font-heading text-sm font-semibold text-primary md:text-base">
              {badge.label}
            </h3>
            <p className="mt-1 hidden font-body text-xs text-primary/60 md:block">
              {badge.subtitle}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
