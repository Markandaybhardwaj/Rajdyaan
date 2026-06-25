// ---------------------------------------------------------------------------
// StorageInfo — Reusable storage conditions callout
// ---------------------------------------------------------------------------

export default function StorageInfo({ product }) {
  if (!product.storageConditions) return null;

  return (
    <section className="bg-[#faf6ee]">
      <div className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-12">
        <div className="rounded-2xl border border-amber-200/60 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 rounded-full bg-amber-100 p-3">
              <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-primary md:text-lg">
                Storage Instructions
              </h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-dark/70 md:text-base">
                {product.storageConditions}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
