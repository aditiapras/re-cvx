import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  ChartNoAxesColumn,
  Bell,
  ShieldCheck,
  UserRound,
  Building,
  Pin,
  Circle,
  LoaderCircle,
  Menu,
  MoreVertical,
  Calendar,
  CalendarDays,
  GraduationCap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

export default function Pendaftaran() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-7xl mx-auto w-full">
      <div>
        <p className="font-semibold">Pendaftaran</p>
        <p className="text-muted-foreground text-sm">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae,
          sit.
        </p>
      </div>
      <Tabs defaultValue="profile" className="text-sm text-muted-foreground">
        <TabsList variant="line">
          <TabsTrigger value="profile">
            <UserRound /> Kategori
          </TabsTrigger>
          <TabsTrigger value="security">
            <ShieldCheck /> Pendaftaran
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <div className="block md:flex md:items-center md:justify-between">
            <Input
              placeholder="Search workspace..."
              className="h-9 w-full rounded-sm md:max-w-xs"
            />
            <div className="lg:flex lg:items-center lg:space-x-3">
              <div className="hidden items-center space-x-2 lg:flex">
                <Label className="whitespace-nowrap text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                  Show active spaces
                </Label>
                <Switch />
              </div>
              <span className="hidden h-8 w-px bg-tremor-border dark:bg-dark-tremor-border lg:block" />
              <Button type="button">Add workspace</Button>
            </div>
          </div>

          {/* CARD */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4">
            <div className="border mt-4 rounded-md flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="p-4 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-lg">Title</p>
                    <p>description</p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical />
                  </Button>
                </div>
                <p>
                  {" "}
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Recusandae, sit.
                </p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Progress</p>
                    <p className="font-semibold">Progress</p>
                  </div>
                  <Progress value={80} />
                </div>
              </div>
              <div className="bg-secondary px-4 py-2 flex gap-2 justify-end">
                <Button type="button" variant="outline">
                  Edit
                </Button>
                <Button type="button">Daftar</Button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex h-72 items-center justify-center rounded-lg border bg-muted">
            <div className="text-center">
              <ChartNoAxesColumn
                className="mx-auto size-7"
                aria-hidden={true}
              />
              <p className="mt-2 font-medium">No data to show</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Please check back later.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="block md:flex md:items-center md:justify-between">
            <Input
              placeholder="Search workspace..."
              className="h-9 w-full rounded-sm md:max-w-xs"
            />
            <div className="lg:flex lg:items-center lg:space-x-3">
              <div className="hidden items-center space-x-2 lg:flex">
                <label
                  htmlFor="show-active-spaces"
                  className="whitespace-nowrap text-tremor-default text-tremor-content dark:text-dark-tremor-content"
                >
                  Show active spaces
                </label>
                <Switch id="show-active-spaces" name="show-active-spaces" />
              </div>
              <span className="hidden h-8 w-px bg-tremor-border dark:bg-dark-tremor-border lg:block" />
              <Button type="button">Add workspace</Button>
            </div>
          </div>

          {/* CARD */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3">
            <div className="border mt-4 rounded-md flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="p-4 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <p className="font-semibold text-lg">Title</p>
                    <Badge size="sm" variant="outline">
                      Active
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical />
                  </Button>
                </div>
                <p className="line-clamp-1">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                  Minima, accusamus eos? Doloremque, iste iusto ut nesciunt
                  aliquam vero dolor quaerat.
                </p>
                <div className="h-[200px] bg-muted rounded-lg"></div>
                <div className="flex gap-4 items-center">
                  <div className="flex gap-1 items-center">
                    <GraduationCap className="size-4" />
                    <p className="text-xs">SDIT</p>
                  </div>
                  <div className="flex gap-1 items-center">
                    <CalendarDays className="size-4" />
                    <p className="text-xs">2023-01-01</p>
                  </div>
                  <div className="flex gap-1 items-center">
                    <UserRound className="size-4" />
                    <p className="text-xs">100 Orang</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Progress</p>
                    <p className="font-semibold">Progress</p>
                  </div>
                  <Progress value={80} />
                </div>
              </div>
              <div className="border-t px-4 py-2 flex gap-2 justify-end">
                <Button type="button" variant="outline">
                  Edit
                </Button>
                <Button type="button">Daftar</Button>
              </div>
            </div>
          </div>

          {/* NO DATA CARD */}
          <div className="mt-6 flex h-72 items-center justify-center rounded-lg border bg-muted">
            <div className="text-center">
              <ChartNoAxesColumn
                className="mx-auto size-7"
                aria-hidden={true}
              />
              <p className="mt-2 font-medium">No data to show</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Please check back later.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
