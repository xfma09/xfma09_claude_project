import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { InfoIcon } from "lucide-react";

const PRESET = {
  code: "bLTjNYa8",
  style: "rhea",
  baseColor: "stone",
  font: "public-sans",
  radius: "default (0.625rem)",
  menuAccent: "subtle",
};

export default function PresetPreviewPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-16">
      <div className="flex flex-col gap-3">
        <h1 className="font-heading text-2xl font-semibold">
          적용된 shadcn preset 미리보기
        </h1>
        <p className="text-sm text-muted-foreground">
          아래 값들은 이 프로젝트에 적용된 preset 코드 {PRESET.code}
          {" "}(style: {PRESET.style}, baseColor/theme: {PRESET.baseColor})의
          실제 렌더링 결과입니다. 기본 preset(예: nova) 대비 색상, 폰트,
          라운드 처리가 어떻게 다른지 컴포넌트로 직접 비교해보세요.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(PRESET).map(([key, value]) => (
            <Badge key={key} variant="secondary">
              {key}: {value}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">Button</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="xs">Extra small</Button>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">Badge</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">Card</h2>
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>stone 테마 카드</CardTitle>
            <CardDescription>
              baseColor가 stone일 때의 카드 배경, 테두리, radius를
              확인하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Input placeholder="preset 확인용 입력" />
          </CardContent>
          <CardFooter className="gap-2">
            <Button variant="outline">취소</Button>
            <Button>저장</Button>
          </CardFooter>
        </Card>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">Alert</h2>
        <Alert>
          <InfoIcon />
          <AlertTitle>public-sans 폰트 적용 확인</AlertTitle>
          <AlertDescription>
            이 텍스트의 서체가 preset의 font 값(public-sans)을 따르는지
            비교해보세요.
          </AlertDescription>
        </Alert>
      </section>
    </div>
  );
}
