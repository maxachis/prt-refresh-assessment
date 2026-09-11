# provision.sh reports "Deployed" when the box did nothing

When the remote half of `deploy/provision.sh` takes its no-op branch, it
`exit 0`s inside the ssh heredoc and the local half carries on to print
`>>> Deployed <sha> to prt-refresh`. Open; two re-runs on 2026-09-11 said
"Deployed" while the service was still the previous day's process.

## What happened

`deploy/provision.sh` line ~119: if the checkout already matches `$REF`,
`refresh.db` exists, the unit is active and `/api/meta` answers, the remote
script prints "already at …, nothing to do" and exits 0. That message is
inside the ssh output, which the local script does not look at; it then
runs the "checking the app answers" curl and the `cat <<EOF` banner that
says Deployed. Piped through `tail -15`, the no-op line has scrolled off and
only the banner is visible.

It matters because the no-op test is exactly what a *failed* deploy leaves
behind (see
[two-deploys-at-once-collide-on-the-database-build.md](two-deploys-at-once-collide-on-the-database-build.md)):
the checkout is at the right commit, an old database is present, the old
process is answering. The three checks confirm the box looks deployed, not
that it is. On 2026-09-11 I ran the script twice after a lock error, read
"Deployed e7c8dcd" both times, and only found the truth from
`systemctl show -p ExecMainStartTimestamp` on the box.

## Approaches

Two halves. The banner should say which branch ran — pass the no-op back as
a distinct exit code or a marker line the local half checks, and print
"already deployed, no change" instead of "Deployed". And the no-op test
should ask the running process what it is serving rather than the checkout
on disk: `/api/meta` could carry the commit the process started from, or
the unit's start time could be compared to the checkout's. Not decided;
the first half is a few lines, the second is a small API addition.
