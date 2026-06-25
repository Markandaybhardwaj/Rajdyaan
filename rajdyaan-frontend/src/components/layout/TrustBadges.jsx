// ---------------------------------------------------------------------------
// TrustBadges — 4 Trust Badges Section
// ---------------------------------------------------------------------------
// Placed below ProductGrid and above BrandStory
// ---------------------------------------------------------------------------

export default function TrustBadges() {
  const badges = [
    {
      id: 'fssai',
      label: 'FSSAI Approved',
      icon: (
        <div className="h-24 w-24 md:h-28 md:w-28 flex items-center justify-center">
          <img
            src="https://res.cloudinary.com/dzikgxfxr/image/upload/v1778416647/fssai_ktkiuz.jpg"
            alt="FSSAI Approved"
            className="w-full h-full object-contain"
          />
        </div>
      ),
    },
    {
      id: 'vegan',
      label: '100% Vegan',
      icon: (
        <div className="h-24 w-24 md:h-28 md:w-28 flex items-center justify-center">
          <img
            src="https://res.cloudinary.com/dzikgxfxr/image/upload/v1778416662/100_vegan_ghos0r.png"
            alt="100% Vegan"
            className="w-full h-full object-contain"
          />
        </div>
      ),
    },
    {
      id: 'preservatives',
      label: 'No Added Preservatives',
      icon: (
        <div className="h-24 w-24 md:h-28 md:w-28 flex items-center justify-center">
          <img
            src="https://res.cloudinary.com/dzikgxfxr/image/upload/v1778416680/no_presevative_added_ofs9ik.png"
            alt="No Added Preservatives"
            className="w-full h-full object-contain"
          />
        </div>
      ),
    },
    {
      id: 'plant',
      label: 'Plant Based',
      icon: (
        <div className="h-24 w-24 md:h-28 md:w-28 flex items-center justify-center">
          <img
            src="https://res.cloudinary.com/dzikgxfxr/image/upload/v1778416547/plant_based_cp2en6.png"
            alt="Plant Based"
            className="w-full h-full object-contain"
          />
        </div>
      ),
    },
  ];

  return (
    <section className="bg-white py-12 md:py-20 border-y border-primary/5">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-4">
          {badges.map((badge) => (
            <div key={badge.id} className="flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1">
              <div className="mb-4">
                {badge.icon}
              </div>
              <h3 className="font-heading text-lg font-bold text-primary md:text-xl">
                {badge.label}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
