"use client";

import { useQuery } from "convex/react";
import {
  Clock,
  MessageCircle,
  MoreVertical,
  Search,
  ThumbsUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";

function timeAgo(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (day > 0) return `${day} hari lalu`;
  if (hr > 0) return `${hr} jam lalu`;
  if (min > 0) return `${min} menit lalu`;
  return `baru saja`;
}

export default function Informasi() {
  const data = useQuery(api.informasi.listInformasi, {});
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-7xl mx-auto w-full">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold">Informasi</p>
          <p className="text-muted-foreground text-sm">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae,
            sit.
          </p>
        </div>

        <Link href="/portal/informasi/create">
          <Button variant="outline" className="w-full">
            Buat Informasi
          </Button>
        </Link>
      </div>
      <div className="max-w-[71%] relative">
        <Search className="absolute top-1/2 left-2 -translate-y-1/2 size-4" />
        <Input placeholder="Cari postingan..." className="pl-8" />
      </div>
      <div className="grid grid-cols-7 gap-4">
        <div className="col-span-5 space-y-4">
          {(data ?? []).map((item) => (
            <Link
              key={item._id}
              href={`/portal/informasi/${item.slug}`}
              className="block"
            >
              <div
                className="p-4 border rounded-xl flex flex-col gap-4 hover:border-muted-foreground transition-all duration-300 cursor-pointer"
              >
              <div className="flex items-start justify-between">
                <p className="font-semibold text-xl line-clamp-1">
                  {item.title}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    // Prevent navigating when clicking the more menu
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <MoreVertical />
                </Button>
              </div>
              <div className="h-32 bg-muted rounded-xl overflow-hidden">
                {item.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <Image
                    src={item.coverUrl}
                    alt={item.title}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {item.description}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Pembelajaran</Badge>
                <Badge variant="secondary">
                  {item.type === "galeri" ? "Galeri" : "Umum"}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    Posted by Admin
                  </p>
                  <Clock className="size-3" />
                  <p className="text-xs text-muted-foreground">
                    {timeAgo(item.createdAt)}
                  </p>
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
            </Link>
          ))}
        </div>
        <div className="col-span-2">
          <div className="p-4 border rounded-md flex flex-col gap-2">
            <p className="font-semibold mb-2">Jenis Postingan</p>
            <Badge variant="secondary" size="md" className="w-fit">
              Blog
            </Badge>
            <Badge variant="secondary" size="md" className="w-fit">
              Artikel
            </Badge>
            <Badge variant="secondary" size="md" className="w-fit">
              Umum
            </Badge>
            <Badge variant="secondary" size="md" className="w-fit">
              Galeri
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
