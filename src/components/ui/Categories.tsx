const categoryColors = [
  "", // Default
  "btn-primary",
  "btn-secondary",
  "btn-accent",
  "btn-success",
  "btn-warning",
  "btn-info",
  "btn-error",
];

interface CategoriesProps {
  categories: { name: string; path: string }[];
}

export default function Categories({ categories }: CategoriesProps) {
  return (
    <div className="bg-base-100 p-4">
      <div className="flex justify-center space-x-2 md:space-x-4 overflow-x-auto pb-2">
        {categories.map((cat, index) => (
          <a
            href={cat.path}
            key={cat.name}
            className={`btn btn-dash btn-sm whitespace-nowrap ${
              categoryColors[index % categoryColors.length]
            }`}
          >
            {cat.name}
          </a>
        ))}
      </div>
    </div>
  );
}