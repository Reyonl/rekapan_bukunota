# E2E smoke

Server harus jalan (mis. `php artisan serve --port=8000` dengan PHP >= 8.3):

    SMOKE_BASE=http://127.0.0.1:8000 node e2e/smoke.mjs

Cek per route: render <h1>, tanpa pageerror, tanpa horizontal overflow,
di viewport desktop 1280 & mobile 390, plus navigasi in-app lewat bottom nav.
`probe.mjs` = helper debug satu halaman (opsional, tidak masuk CI).
