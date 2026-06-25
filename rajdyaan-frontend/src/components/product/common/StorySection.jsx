// ---------------------------------------------------------------------------
// StorySection — Full-width visual storytelling block
// ---------------------------------------------------------------------------
// Renders a single story section with 4 layout modes:
//   - full-width: image fills entire width, text overlay
//   - image-left: image on left, text on right
//   - image-right: text on left, image on right
//   - text-only: centered text block, no image
// ---------------------------------------------------------------------------
import Image from 'next/image';

export default function StorySection({ section, index }) {
  const { title, description, image, layout = 'image-left' } = section;
  const hasImage = image?.url;

  // --- Full Width Layout ---
  if (layout === 'full-width' && hasImage) {
    return (
      <div className="relative w-full overflow-hidden" style={{ minHeight: '400px' }}>
        <Image
          src={image.url}
          alt={title}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16">
          <h3 className="font-heading text-2xl font-bold text-white md:text-3xl lg:text-4xl">
            {title}
          </h3>
          <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-white/85 md:text-base">
            {description}
          </p>
        </div>
      </div>
    );
  }

  // --- Text Only Layout ---
  if (layout === 'text-only' || !hasImage) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-12 text-center md:px-8 md:py-16">
        <h3 className="font-heading text-xl font-bold text-primary md:text-2xl">
          {title}
        </h3>
        <div className="mx-auto mt-3 h-px w-12 bg-accent/40" />
        <p className="mt-5 font-body text-sm leading-relaxed text-dark/75 md:text-base">
          {description}
        </p>
      </div>
    );
  }

  // --- Image Left / Image Right Layout ---
  const isImageLeft = layout === 'image-left';
  const isEven = index % 2 === 0;
  const imageOnLeft = layout === 'image-left' ? true : layout === 'image-right' ? false : isEven;

  return (
    <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-10 md:grid-cols-2 md:gap-12 md:px-8 md:py-16 lg:gap-16">
      {/* Image */}
      <div className={`relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#faf6ee] ${imageOnLeft ? 'md:order-1' : 'md:order-2'}`}>
        <Image
          src={image.url}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 hover:scale-105"
        />
      </div>

      {/* Text */}
      <div className={`flex flex-col gap-4 ${imageOnLeft ? 'md:order-2' : 'md:order-1'}`}>
        <h3 className="font-heading text-xl font-bold text-primary md:text-2xl lg:text-3xl">
          {title}
        </h3>
        <div className="h-px w-12 bg-accent/40" />
        <p className="font-body text-sm leading-relaxed text-dark/75 md:text-base">
          {description}
        </p>
      </div>
    </div>
  );
}
