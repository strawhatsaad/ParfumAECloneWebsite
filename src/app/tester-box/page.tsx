import { TesterBoxBuilder } from "@/components/TesterBoxBuilder";
import { getTesterProductsAndFilters } from "@/lib/queries";

export default async function TesterBoxPage() {
  const { products, filters, testerBoxVariantId } =
    await getTesterProductsAndFilters();

  if (!products || !testerBoxVariantId) {
    return <p>Error loading products. Please try again later.</p>;
  }

  return (
    <main className="container mx-auto py-8">
      <TesterBoxBuilder
        products={products}
        filters={filters}
        testerBoxVariantId={testerBoxVariantId}
      />
    </main>
  );
}
