VERDICT: PASS

- frontend/src/lib/auth-errors.ts:~175: a 429 now surfaces the server message ("Too many login attempts. Please try again in 15 minutes.") with title "Rate Limited". login/page.tsx:49-52 shows it via toast.error, so the user sees the retry window instead of a generic message. This matches the spec's UX note.
- The message is identical for every email, so no account enumeration.
- Side effect (acceptable): the global limiter's 429 text ("Too many requests, please try again later") also shows verbatim on other pages that use getAuthErrorInfo. It is clear copy.
- Non-blocking: the message hardcodes "15 minutes" while the window is env-configurable. It is correct at defaults, so it is not a real problem.
- Accessibility: no markup change. Error feedback still goes through the existing toast, so there is no regression.
