import { Logo } from "@/components/ui/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-20">
          <Logo size="lg" />
          <p className="mt-8 text-lg text-muted-foreground leading-relaxed max-w-md">
            Master IELTS Reading with AI-powered practice. Read, annotate, and
            test your comprehension with smart questions tailored to every
            passage.
          </p>
          <div className="mt-12 flex gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-primary/50" />
              Read & Annotate
            </div>
            <div className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-primary/50" />
              AI Questions
            </div>
            <div className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-primary/50" />
              Track Progress
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex justify-center mb-8">
            <Logo size="md" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
