# oai.locker deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`. GitHub Actions sends
the triggering commit SHA to the VPS with a restricted SSH key. The VPS fetches
that exact commit from `origin/main`, builds it as the isolated `oai-builder`
user, validates the static output, and publishes it atomically.

The candidate release is checked through Nginx on `127.0.0.1:18080` before the
public `current` link changes. The server keeps the five newest successful
releases. Failed builds are removed and never replace the live release.

## GitHub Actions secrets

- `OAI_LOCKER_DEPLOY_KEY_V2`: private Ed25519 key for the restricted `deploy`
  user.
- `OAI_LOCKER_KNOWN_HOSTS`: pinned SSH host key entry for `198.23.137.19`.

## Server security boundary

The public key entry in `/home/deploy/.ssh/authorized_keys` must use this forced
command (followed by the public key):

```text
restrict,command="/usr/local/sbin/dispatch-oai-locker"
```

`dispatch-oai-locker` accepts only `deploy <40-character-sha>` and invokes the
root-owned deployment script through the single allowed sudo command. The
`deploy` user cannot write the repository, build workspace, release directory,
or deployment scripts. Repository lifecycle scripts run as `oai-builder` in a
transient systemd sandbox with no access to the production web root.

Installed server files:

- `/usr/local/sbin/deploy-oai-locker`
- `/usr/local/sbin/dispatch-oai-locker`
- `/etc/sudoers.d/oai-locker-deploy`
- `/etc/nginx/sites-available/oai.locker`

The sudo policy source is tracked in `deploy/sudoers/oai-locker-deploy`.
