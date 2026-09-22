// Single source of truth for the storefront's category/subcategory taxonomy.
// Previously `categories`/`categoryOptions` were three separate hardcoded
// copies (Sidebar.jsx, Catalog.jsx, admin/ProductForm.jsx) that a comment in
// each one warned had to be kept "byte-for-byte in sync" — Catalog's and the
// backend's category filter both do an exact match against whatever's saved
// on a product, so a drifted copy silently shows zero products for that
// category. Importing from here instead removes that failure mode entirely.
export const categories = [
  'Outerwear',
  'Knitwear',
  'Denim',
  'Shirting',
  'Accessories',
  'Upperwear',
  'Bottomwear',
  'Winter Collection',
];

// Which subcategory options are offered depends on the selected category —
// unlike the old flat 3-option list (Crewnecks/Cardigans/Jackets) that showed
// the same options regardless of category and wasn't tied to it at all.
export const subcategoriesByCategory = {
  Outerwear: ['Jackets', 'Coats', 'Overcoats', 'Vests'],
  Knitwear: ['Crewnecks', 'Cardigans', 'Sweaters', 'Turtlenecks'],
  Denim: ['Jeans', 'Denim Jackets', 'Denim Shorts'],
  Shirting: ['Shirts', 'Oxford Shirts', 'Resort Shirts'],
  Accessories: ['Belts', 'Caps', 'Scarves', 'Bags'],
  Upperwear: ['T-Shirt', 'Top', 'Shirt', 'Hoodie', 'Sweatshirt'],
  Bottomwear: ['Jeans', 'Trousers', 'Shorts', 'Joggers', 'Cargo Pants'],
  'Winter Collection': ['Sweaters', 'Jackets', 'Thermals', 'Mufflers'],
};
