"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { verifyPin } from "./actions";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await verifyPin(pin);
      if (result.success) {
        router.push("/");
      } else {
        setError("Fel PIN-kod. Försök igen.");
        setPin("");
      }
    });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-background)",
        fontFamily: "var(--font-sans)",
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "var(--color-surface)",
          borderRadius: "12px",
          border: "1px solid var(--color-border)",
          padding: "40px",
          width: "100%",
          maxWidth: "380px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        }}
      >
        <h1
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "var(--color-foreground)",
            textAlign: "center",
            margin: "0 0 8px 0",
          }}
        >
          Classroom
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "var(--color-muted)",
            textAlign: "center",
            margin: "0 0 28px 0",
          }}
        >
          Ange PIN-kod för att fortsätta
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            maxLength={128}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Lösenord"
            autoFocus
            disabled={isPending}
            style={{
              width: "100%",
              padding: "10px 14px",
              fontSize: "16px",
              fontFamily: "var(--font-sans)",
              border: `1px solid ${error ? "#ef4444" : "var(--color-border)"}`,
              borderRadius: "8px",
              outline: "none",
              background: "var(--color-surface)",
              color: "var(--color-foreground)",
              textAlign: "center",
              letterSpacing: "4px",
              transition: "border-color 0.15s ease",
            }}
            onFocus={(e) => {
              if (!error) e.target.style.borderColor = "var(--color-accent)";
            }}
            onBlur={(e) => {
              if (!error) e.target.style.borderColor = "var(--color-border)";
            }}
          />

          {error && (
            <p
              style={{
                fontSize: "13px",
                color: "#ef4444",
                textAlign: "center",
                margin: "10px 0 0 0",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending || pin.length === 0}
            style={{
              width: "100%",
              marginTop: "16px",
              padding: "10px 16px",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: "var(--font-sans)",
              color: "#ffffff",
              background:
                isPending || pin.length === 0
                  ? "var(--color-muted-light)"
                  : "var(--color-accent)",
              border: "none",
              borderRadius: "8px",
              cursor:
                isPending || pin.length === 0 ? "not-allowed" : "pointer",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (!isPending && pin.length > 0)
                (e.target as HTMLButtonElement).style.background =
                  "var(--color-accent-hover)";
            }}
            onMouseLeave={(e) => {
              if (!isPending && pin.length > 0)
                (e.target as HTMLButtonElement).style.background =
                  "var(--color-accent)";
            }}
          >
            {isPending ? "Verifierar..." : "Logga in"}
          </button>
        </form>
      </div>
    </div>
  );
}
