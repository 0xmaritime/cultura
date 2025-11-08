import SearchLens from "@/components/search-lens/search-lens";

export const metadata = {
  title: "Cultura Lens",
  description: "Dive into the Cultura Search Lens to explore entities, metrics, and receipts.",
};

export default function LensPage() {
  return (
    <div className="bg-gradient-to-b from-[#040406] via-[#090917] to-[#05050b] text-white">
      <SearchLens />
    </div>
  );
}
