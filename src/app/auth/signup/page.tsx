"use client";

import Link from "next/link";
import { OAuthSection } from "@/components/auth/OAuthSection";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignupPage() {
  return (
    <Card className="shadow-lg">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl">Start learning today</CardTitle>
        <CardDescription>
          Create an account to begin practicing IELTS Reading
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <OAuthSection />
        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-primary hover:underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
