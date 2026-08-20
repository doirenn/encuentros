import { WorkshopForm } from "@/components/admin/WorkshopForm";

export default function NewWorkshopPage() {
  return (
    <div className="container-app py-12">
      <p className="kicker">Panel</p>
      <h1 className="h1 mt-3 mb-8">Nuevo workshop</h1>
      <WorkshopForm />
    </div>
  );
}
