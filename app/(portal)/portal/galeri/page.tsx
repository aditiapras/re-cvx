import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  ClockPlus,
  MessageCircle,
  MoreVertical,
  Search,
  ThumbsUp,
} from "lucide-react";

export default function Galeri() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-7xl mx-auto w-full">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold">Galeri</p>
          <p className="text-muted-foreground text-sm">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae,
            sit.
          </p>
        </div>
        <Button variant="outline">Buat Postingan</Button>
      </div>
      <div className="max-w-[71%] relative">
        <Search className="absolute top-1/2 left-2 -translate-y-1/2 size-4" />
        <Input placeholder="Cari postingan..." className="pl-8" />
      </div>
      <div className="grid grid-cols-7 gap-4">
        <div className="col-span-5">
          <div className="p-4 border rounded-xl flex flex-col gap-4 hover:border-muted-foreground transition-all duration-300">
            <div className="flex items-start justify-between">
              <p className="font-semibold text-xl line-clamp-1">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Corporis, et!
              </p>
              <Button variant="ghost" size="icon">
                <MoreVertical />
              </Button>
            </div>
            <div className="h-32 bg-muted rounded-xl"></div>
            <p className="text-sm text-muted-foreground">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Labore
              eveniet placeat quas dolore rerum unde doloribus aliquid dolorem
              ab eum provident harum sed qui ipsam, dolor molestias. Tempora,
              omnis quae.
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Pembelajaran</Badge>
              <Badge variant="secondary">Umum</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">Posted by Admin</p>
                <Clock className="size-3" />
                <p className="text-xs text-muted-foreground">2 jam lalu</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="size-4" />
                  <p className="text-xs text-muted-foreground">123</p>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="size-4" />
                  <p className="text-xs text-muted-foreground">123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-2">
          <div className="p-4 border rounded-md flex flex-col gap-2">
            <p className="font-semibold mb-2">Jenis Postingan</p>
            <Badge variant="secondary" size="md" className="w-fit">
              Pembelajaran
            </Badge>
            <Badge variant="secondary" size="md" className="w-fit">
              Pembelajaran
            </Badge>
            <Badge variant="secondary" size="md" className="w-fit">
              Pembelajaran
            </Badge>
            <Badge variant="secondary" size="md" className="w-fit">
              Pembelajaran
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
