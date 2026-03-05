# Deployment

## Architecture

```
GitHub Actions (on git tag v*)
      ↓ pnpm build (VITE_PROD_URL injected)
   dist/
      ↓ aws s3 sync --delete
S3 bucket: excelos-static (ap-southeast-1)
      ↓ Origin Access Control (OAC)
CloudFront: https://d10i2j79wgfo75.cloudfront.net
```

Built code lives in S3 (`excelos-static`). CloudFront serves it over HTTPS.
API keys are stored in the user's browser localStorage — never on the server.

---

## First-Time Setup

### 1. AWS credentials
```bash
aws configure
# Region: ap-southeast-1
```

### 2. Provision infrastructure
```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform apply
```

### 3. Add GitHub secrets
After `terraform apply`, run:
```bash
terraform output cloudfront_url
terraform output cloudfront_distribution_id
terraform output s3_bucket_name
terraform output iam_access_key_id
terraform output -raw iam_secret_access_key
```

Add to GitHub repo → Settings → Secrets and variables → Actions:

| Secret | Value |
|--------|-------|
| `VITE_PROD_URL` | `https://d10i2j79wgfo75.cloudfront.net/` |
| `AWS_CLOUDFRONT_DISTRIBUTION_ID` | from terraform output |
| `AWS_S3_BUCKET` | `excelos-static` |
| `AWS_ACCESS_KEY_ID` | from terraform output |
| `AWS_SECRET_ACCESS_KEY` | from terraform output |

---

## Deploying a Release

Deployment triggers automatically when a version tag is pushed.

```bash
# 1. Build locally to verify (optional)
VITE_PROD_URL=https://d10i2j79wgfo75.cloudfront.net/ pnpm build

# 2. Commit changes
git add .
git commit -m "your commit message"
git push

# 3. Tag and push to trigger deploy
git tag v0.x.x
git push --tags
```

GitHub Actions will:
1. Run `pnpm build` with `VITE_PROD_URL` injected
2. Sync `dist/` to S3
3. Invalidate CloudFront cache
4. Create a GitHub release with changelog notes

Monitor progress at: GitHub → Actions → Deploy

---

## Sideloading the Add-in (Excel)

After a successful deploy, build locally to get the production manifest:

```bash
VITE_PROD_URL=https://d10i2j79wgfo75.cloudfront.net/ pnpm build
```

Then copy `dist/manifest.prod.xml` to your WEF folder.

Verify the manifest contains the CloudFront URL:
```bash
grep "cloudfront" dist/manifest.prod.xml
```

---

## Verify Deployment

```bash
curl https://d10i2j79wgfo75.cloudfront.net/taskpane.html
# Should return 200 with HTML
```

---

## Teardown

```bash
cd infra
terraform destroy
```
