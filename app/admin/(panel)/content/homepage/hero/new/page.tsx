import HeroBannerForm from "@/components/admin/HeroBannerForm";
import { createHero } from "../../../actions";


export default function NewHeroPage() {
  return (
    <>
      
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Add hero banner</h1>
      <HeroBannerForm action={createHero} />
    </>
  );
}
