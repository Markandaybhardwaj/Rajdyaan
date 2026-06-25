// ---------------------------------------------------------------------------
// TemplateSelector — Maps category.templateSlug to the correct template
// ---------------------------------------------------------------------------
// This is the BRAIN of the category-driven product page system.
//
// HOW it works:
//   1. The product detail page passes the full product object here
//   2. We read product.category.templateSlug
//   3. We render the matching template component
//   4. If no match → SweetenerTemplate (the default)
//
// WHY a registry pattern:
//   Adding a new category = adding ONE line to the TEMPLATE_MAP below.
//   No switch statements, no if-else chains, no hunting through files.
// ---------------------------------------------------------------------------
import GheeTemplate from './templates/GheeTemplate';
import OilTemplate from './templates/OilTemplate';
import SweetenerTemplate from './templates/SweetenerTemplate';
import SareeTemplate from './templates/SareeTemplate';

// ---------------------------------------------------------------------------
// Template Registry — maps templateSlug → React component
// ---------------------------------------------------------------------------
const TEMPLATE_MAP = {
  ghee:      GheeTemplate,
  oil:       OilTemplate,
  sweetener: SweetenerTemplate,
  saree:     SareeTemplate,
  default:   SweetenerTemplate,  // SweetenerTemplate doubles as the default
};

// ---------------------------------------------------------------------------
// TemplateSelector component
// ---------------------------------------------------------------------------
export default function TemplateSelector({ product }) {
  const templateSlug = product.category?.templateSlug || 'default';
  const Template = TEMPLATE_MAP[templateSlug] || SweetenerTemplate;

  return <Template product={product} />;
}
