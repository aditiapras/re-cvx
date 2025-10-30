import { PlateEditor } from "@/components/rte/plate-editor";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function CreateArticle() {
  return (
    <div className="max-w-7xl w-full mx-auto p-4 pt-0 relative">
      <p className="font-semibold mb-4">Buat Postingan</p>
      {/* <Separator className="my-4" /> */}
      <div className="grid grid-cols-8 gap-4">
        <div className="col-span-6">
          <PlateEditor />
        </div>
        <div className="col-span-2 flex flex-col gap-4">
          <p className="font-semibold">Article Information</p>
          <div className="flex w-full gap-2">
            <Button>Publish</Button>
            <Button variant="outline">Save Draft</Button>
          </div>
          <div>

          </div>
        </div>
      </div>
    </div>
  );
}
