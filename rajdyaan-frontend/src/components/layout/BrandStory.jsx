// ---------------------------------------------------------------------------
// BrandStory — emotional 2-column section
// ---------------------------------------------------------------------------
// Left: text with olive green accent bar.  Right: brand image.
// ---------------------------------------------------------------------------
import Image from 'next/image';

const DEFAULT_BRAND_STORY_IMAGE = 'https://res.cloudinary.com/dzikgxfxr/image/upload/v1778045254/rajdhyaan/brand-story.jpg';
const DEFAULT_BRAND_STORY_ALT = 'Traditional Indian farmlands with mustard fields at golden hour';

export default function BrandStory({ banners }) {
  // Resolve dynamic brand-story banner from the banners array
  const brandStoryBanner = banners?.find(
    (b) => b.key === 'brand-story' && b.isActive && b.image?.url
  );
  const brandStoryImage = brandStoryBanner?.image?.url || DEFAULT_BRAND_STORY_IMAGE;
  const brandStoryAlt = brandStoryBanner?.altText || DEFAULT_BRAND_STORY_ALT;

  return (
    <section id="brand-story" className="bg-white py-16 md:py-24">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-5 md:flex-row md:gap-16 md:px-8">

        {/* ---- Left: Emotional Text ---- */}
        <div className="flex-1">
          <div className="flex items-start gap-4">
            {/* Olive green accent line */}
            <div className="mt-1 hidden h-12 w-1 flex-shrink-0 rounded-full bg-support md:block" />

            <div>
              <h2 className="font-heading text-2xl font-bold text-primary md:text-3xl lg:text-4xl">
                Our Story
              </h2>
              <p className="mt-1 font-heading text-lg font-semibold text-accent md:text-xl">
                Rajdhyaan
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <p className="font-body text-base leading-relaxed text-dark md:text-lg font-medium">
              Operated by <a href="https://share.google/kTmDrvGfpgJQ8cKam" target="_blank" rel="noopener noreferrer" className="text-accent font-bold uppercase tracking-wide hover:underline cursor-pointer">Shree Ganesh Trader</a> — Where Purity Meets Tradition
            </p>

            <p className="font-body text-base leading-relaxed text-dark md:text-lg md:leading-loose">
              It started in the fertile fields of Faijpur village of Uttar Pradesh where purity is not a promise, it&apos;s a way of life. We grew up seeing food the way it was meant to be — fresh, unprocessed, and full of natural goodness. But over time, we noticed something changing. The authentic taste of our roots was slowly fading, replaced by artificial shortcuts and mass production.
            </p>

            <p className="font-body text-base leading-relaxed text-dark md:text-lg md:leading-loose">
              That's when Rajdhyaan was born — not just as a brand, but as a mission to bring back real food.
            </p>

            <p className="font-body text-base leading-relaxed text-dark md:text-lg md:leading-loose">
              Today, Rajdhyaan proudly connects with farmers across <span className="text-primary font-medium">Uttar Pradesh &amp; Uttarakhand</span>, building strong relationships based on trust, fairness, and shared values. Every product we offer carries the essence of traditional methods passed down through generations.
            </p>

            <p className="font-body text-base leading-relaxed text-dark md:text-lg md:leading-loose">
              We believe in doing things the right way — what reaches your home is exactly what nature intended.
            </p>

            <p className="font-body text-base leading-relaxed text-dark md:text-lg md:leading-loose italic">
              Because Rajdhyaan is more than a brand — it's a journey from one village to many, carrying forward the dignity of farmers and the authenticity of real food.
            </p>

            <p className="font-heading text-xl font-bold text-accent md:text-2xl pt-2">
              Khet se Kitchen tak — Swaad bhi Pakka, Vishwas bhi Pakka. 🔥
            </p>
          </div>
        </div>

        {/* ---- Right: Brand Image ---- */}
        <div className="relative flex-1">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md shadow-xl">
            <Image
              src={brandStoryImage}
              alt={brandStoryAlt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* Subtle olive accent border */}
          <div className="absolute -bottom-3 -right-3 hidden h-full w-full rounded-md border-2 border-support/20 md:block" />
        </div>
      </div>
    </section>
  );
}
