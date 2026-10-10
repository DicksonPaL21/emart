"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { filterAlphaNumeric, Notice, useNotice } from "@/components/shared/notice";
export function LoginForm() {
  const { message, setMessage } = useNotice();
  const router = useRouter();
  useEffect(() => {
    if (document.cookie) router.replace("/dashboard");
  }, [router]);
  return (
    <div className="mx-auto w-full max-w-[360px] pt-[100px]">
      <form
        id="login"
        onSubmit={(event) => {
          event.preventDefault();
          document.cookie = `EMARTSESSIONID=${new FormData(event.currentTarget).get("username")}`;
          router.push("/dashboard");
        }}
        className="space-y-2"
      >
        <h1>
          <Image
            src="/img/login-logo.png"
            alt="EMART"
            width={641}
            height={153}
            priority
            unoptimized
            className="mx-auto mb-7 h-16 w-auto max-w-full object-contain"
          />
        </h1>
        <label htmlFor="username" className="sr-only">
          Username
        </label>
        <Input
          id="username"
          name="username"
          placeholder="Username"
          required
          autoFocus
          autoComplete="off"
          onKeyDown={(event) => filterAlphaNumeric(event, setMessage)}
        />
        <label htmlFor="password" className="sr-only">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          required
          autoComplete="current-password"
        />
        <Button type="submit" variant="secondary" className="w-full uppercase tracking-widest">
          Log in
        </Button>
      </form>
      <Notice message={message} dismiss={() => setMessage("")} />
    </div>
  );
}
